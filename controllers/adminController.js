const { pool } = require('../config/dbConfig');

const adminController = {
  // Récupérer tous les professionnels disponibles
  async getAvailableProfessionals(req, res) {
    try {
      const query = `
        SELECT 
          u.id,
          u.last_name,
          u.first_name,
          u.speciality,
          (
            SELECT COUNT(*) 
            FROM case_assignments 
            WHERE professional_id = u.id 
            AND status IN ('assigned', 'in_progress')
          ) as current_case_load
        FROM users u
        WHERE u.role = 'pro'
        AND u.status = 'active'
      `;

      const { rows } = await pool.query(query);
      res.json(rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des professionnels:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des professionnels' 
      });
    }
  },

  // Récupérer les cas non assignés
  async getUnassignedCases(req, res) {
    try {
      const query = `
        SELECT 
          c.id,
          c.title,
          c.description,
          c.priority,
          c.status,
          c.type,
          c.created_at as "createdAt"
        FROM cases c
        LEFT JOIN case_assignments ca ON c.id = ca.case_id
        WHERE ca.id IS NULL
        OR c.status = 'new'
        ORDER BY 
          CASE 
            WHEN c.priority = 'high' THEN 1
            WHEN c.priority = 'medium' THEN 2
            WHEN c.priority = 'low' THEN 3
          END,
          c.created_at DESC
      `;

      const { rows } = await pool.query(query);
      res.json(rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des cas:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des cas' 
      });
    }
  },

  // Assigner un cas à un professionnel
  async assignCase(req, res) {
    const { caseId, professionalId, note } = req.body;

    if (!caseId || !professionalId) {
      return res.status(400).json({ 
        error: 'ID du cas et du professionnel requis' 
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Vérifier si le cas existe et n'est pas déjà assigné
      const caseCheckQuery = `
        SELECT status 
        FROM cases 
        WHERE id = $1
      `;
      const { rows: caseRows } = await client.query(caseCheckQuery, [caseId]);

      if (caseRows.length === 0) {
        throw new Error('Cas non trouvé');
      }

      if (caseRows[0].status !== 'new') {
        throw new Error('Ce cas est déjà assigné');
      }

      // Vérifier si le professionnel existe et est actif
      const proCheckQuery = `
        SELECT status 
        FROM users 
        WHERE id = $1 AND role = 'pro'
      `;
      const { rows: proRows } = await client.query(proCheckQuery, [professionalId]);

      if (proRows.length === 0) {
        throw new Error('Professionnel non trouvé');
      }

      if (proRows[0].status !== 'active') {
        throw new Error('Ce professionnel n\'est pas actif');
      }

      // Créer l'assignation
      const assignmentQuery = `
        INSERT INTO case_assignments (
          case_id,
          professional_id,
          assignment_note,
          assigned_at,
          status
        ) VALUES ($1, $2, $3, NOW(), 'assigned')
        RETURNING id
      `;
      await client.query(assignmentQuery, [caseId, professionalId, note]);

      // Mettre à jour le statut du cas
      const updateCaseQuery = `
        UPDATE cases 
        SET status = 'assigned', 
            updated_at = NOW() 
        WHERE id = $1
      `;
      await client.query(updateCaseQuery, [caseId]);

      await client.query('COMMIT');

      res.json({ 
        message: 'Cas assigné avec succès' 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erreur lors de l\'assignation du cas:', error);
      res.status(500).json({ 
        error: error.message || 'Erreur lors de l\'assignation du cas' 
      });
    } finally {
      client.release();
    }
  },

  // Mettre à jour le statut d'un cas
  async updateCaseStatus(req, res) {
    const { caseId } = req.params;
    const { status } = req.body;

    try {
      const query = `
        UPDATE cases 
        SET 
          status = $1, 
          updated_at = NOW() 
        WHERE id = $2 
        RETURNING *
      `;

      const { rows } = await pool.query(query, [status, caseId]);

      if (rows.length === 0) {
        return res.status(404).json({ 
          error: 'Cas non trouvé' 
        });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la mise à jour du statut' 
      });
    }
  },

  // Récupérer les statistiques des assignations
  async getAssignmentStats(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT c.id) as total_cases,
          COUNT(DISTINCT CASE WHEN c.status = 'new' THEN c.id END) as unassigned_cases,
          COUNT(DISTINCT CASE WHEN c.status = 'in_progress' THEN c.id END) as active_cases,
          COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN c.id END) as completed_cases,
          COUNT(DISTINCT ca.professional_id) as assigned_professionals
        FROM cases c
        LEFT JOIN case_assignments ca ON c.id = ca.case_id
      `;

      const { rows } = await pool.query(query);
      res.json(rows[0]);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des statistiques' 
      });
    }
  },

  // Récupérer les statistiques du dashboard
  async getDashboardStats(req, res) {
    try {
      const [userStats, emergencyRequests] = await Promise.all([
        pool.query(`
          WITH recent_activity AS (
            SELECT
              COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users,
              COUNT(CASE WHEN role = 'pro' AND status = 'pending' THEN 1 END) as pending_pros
            FROM users
          ),
          case_stats AS (
            SELECT
              COUNT(CASE WHEN priority = 'high' AND status != 'completed' THEN 1 END) as urgent_cases,
              COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_cases
            FROM cases
          )
          SELECT
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM users WHERE role = 'pro') as total_pros,
            cs.urgent_cases,
            cs.active_cases,
            ra.new_users,
            ra.pending_pros
          FROM recent_activity ra, case_stats cs
        `),
        pool.query(`
          SELECT 
            er.id,
            er.request_type as type,
            er.status,
            er.created_at as "createdAt",
            er.latitude,
            er.longitude
          FROM emergency_requests er
          WHERE er.created_at >= NOW() - INTERVAL '24 hours'
          ORDER BY er.created_at DESC
          LIMIT 5
        `)
      ]);

      const data = userStats.rows[0];
      res.json({
        totalUsers: parseInt(data.total_users),
        totalPros: parseInt(data.total_pros),
        urgentCases: parseInt(data.urgent_cases),
        recentActivity: {
          newUsers: parseInt(data.new_users),
          activeCases: parseInt(data.active_cases),
          pendingPros: parseInt(data.pending_pros)
        },
        emergencyRequests: emergencyRequests.rows
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des statistiques du dashboard'
      });
    }
  },

  // Obtenir les statistiques globales
  async getStatistics(req, res) {
    try {
      const timeFrame = req.query.timeFrame || 'month';
      let timeInterval;
      
      // Définir l'intervalle de temps
      switch(timeFrame) {
        case 'week':
          timeInterval = "INTERVAL '7 days'";
          break;
        case 'year':
          timeInterval = "INTERVAL '1 year'";
          break;
        default: // month
          timeInterval = "INTERVAL '30 days'";
      }

      // Statistiques des utilisateurs
      const userStatsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN updated_at > NOW() - ${timeInterval} THEN 1 END) as active,
          COUNT(CASE WHEN updated_at <= NOW() - ${timeInterval} OR updated_at IS NULL THEN 1 END) as inactive,
          COUNT(CASE WHEN created_at > NOW() - ${timeInterval} THEN 1 END) as new_this_month
        FROM users
        WHERE role = 'user'`;

      // Statistiques des cas
      const caseStatsQuery = `
        WITH monthly_data AS (
          SELECT 
            to_char(date_trunc('month', created_at), 'Mon') as month,
            COUNT(*) as count
          FROM cases
          WHERE created_at > NOW() - ${timeInterval}
          GROUP BY date_trunc('month', created_at)
          ORDER BY date_trunc('month', created_at)
        ),
        case_types AS (
          SELECT 
            type as name,
            COUNT(*) as count
          FROM cases
          GROUP BY type
        )
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN priority = 'high' THEN 1 END) as urgent,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          (SELECT json_agg(monthly_data) FROM monthly_data) as monthly_data,
          (SELECT json_agg(
            json_build_object(
              'name', name,
              'count', count,
              'color', CASE 
                WHEN name = 'high' THEN '#FF4444'
                WHEN name = 'medium' THEN '#2196F3'
                ELSE '#4CAF50'
              END
            )
          ) FROM case_types) as by_type
        FROM cases`;

      // Statistiques des professionnels
      const proStatsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COALESCE(
            (SELECT ROUND(AVG(case_count))
            FROM (
              SELECT professional_id, COUNT(*) as case_count
              FROM case_assignments
              WHERE status = 'in_progress'
              GROUP BY professional_id
            ) as case_counts),
            0
          ) as average_case_load
        FROM users
        WHERE role = 'pro'`;

      // Exécuter toutes les requêtes en parallèle
      const [userStats, caseStats, proStats] = await Promise.all([
        pool.query(userStatsQuery),
        pool.query(caseStatsQuery),
        pool.query(proStatsQuery)
      ]);

      // Fonction utilitaire pour convertir en nombre
      const toNumber = (value) => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
      };

      // Formater les données avec conversion explicite des nombres
      const formattedData = {
        userStats: {
          total: toNumber(userStats.rows[0].total),
          active: toNumber(userStats.rows[0].active),
          inactive: toNumber(userStats.rows[0].inactive),
          newThisMonth: toNumber(userStats.rows[0].new_this_month)
        },
        caseStats: {
          total: toNumber(caseStats.rows[0].total),
          urgent: toNumber(caseStats.rows[0].urgent),
          inProgress: toNumber(caseStats.rows[0].in_progress),
          completed: toNumber(caseStats.rows[0].completed),
          monthlyData: (caseStats.rows[0].monthly_data || []).map(item => ({
            month: String(item.month),
            count: toNumber(item.count)
          })),
          byType: (caseStats.rows[0].by_type || []).map(item => ({
            name: String(item.name),
            count: toNumber(item.count),
            color: String(item.color)
          }))
        },
        proStats: {
          total: toNumber(proStats.rows[0].total),
          active: toNumber(proStats.rows[0].active),
          pending: toNumber(proStats.rows[0].pending),
          averageCaseLoad: toNumber(proStats.rows[0].average_case_load)
        }
      };

      // Log pour vérifier le format des données
      console.log('Données formatées:', JSON.stringify(formattedData, null, 2));

      res.json(formattedData);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message 
      });
    }
  },

  // Obtenir la liste des professionnels
  async getProfessionals(req, res) {
    try {
      const query = `
        SELECT 
          u.id,
          u.last_name,
          u.first_name,
          u.email,
          u.phone_number,
          u.status,
          u.created_at,
          COUNT(c.id) as active_cases
        FROM users u
        LEFT JOIN case_assignments ca ON u.id = ca.professional_id
        LEFT JOIN cases c ON ca.case_id = c.id AND c.status = 'in_progress'
        WHERE u.role = 'pro'
        GROUP BY u.id
        ORDER BY u.created_at DESC`;

      const result = await pool.query(query);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des professionnels:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des professionnels'
      });
    }
  },

  // Approuver un professionnel
  async approveProfessional(req, res) {
    const { id } = req.params;

    try {
      // Vérifier si le professionnel existe
      const checkQuery = 'SELECT * FROM users WHERE id = $1 AND role = \'pro\'';
      const checkResult = await pool.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Professionnel non trouvé'
        });
      }

      // Mettre à jour le statut du professionnel
      const updateQuery = `
        UPDATE users 
        SET 
          status = 'active',
          updated_at = NOW()
        WHERE id = $1 
        RETURNING id, last_name, first_name, email, status`;

      const result = await pool.query(updateQuery, [id]);

      // Envoyer un email de confirmation (à implémenter)
      // await sendApprovalEmail(result.rows[0].email);

      res.json({
        success: true,
        message: 'Professionnel approuvé avec succès',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erreur lors de l\'approbation du professionnel:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'approbation du professionnel'
      });
    }
  },

  // Supprimer un professionnel
  async deleteProfessional(req, res) {
    const { id } = req.params;

    try {
      // Vérifier si le professionnel a des cas actifs
      const checkCasesQuery = `
        SELECT COUNT(*) 
        FROM case_assignments 
        WHERE professional_id = $1 
        AND status = 'in_progress'`;

      const casesResult = await pool.query(checkCasesQuery, [id]);

      if (casesResult.rows[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer un professionnel ayant des cas actifs'
        });
      }

      // Commencer une transaction
      await pool.query('BEGIN');

      // Supprimer les assignations de cas
      await pool.query(
        'DELETE FROM case_assignments WHERE professional_id = $1',
        [id]
      );

      // Supprimer le professionnel
      const deleteQuery = 'DELETE FROM users WHERE id = $1 AND role = \'pro\' RETURNING id';
      const result = await pool.query(deleteQuery, [id]);

      if (result.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Professionnel non trouvé'
        });
      }

      // Valider la transaction
      await pool.query('COMMIT');

      res.json({
        success: true,
        message: 'Professionnel supprimé avec succès'
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Erreur lors de la suppression du professionnel:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du professionnel'
      });
    }
  },

  // Récupérer tous les utilisateurs
  async getAllUsers(req, res) {
    try {
      const query = `
        SELECT 
          id,
          last_name,
          first_name,
          email,
          role,
          status,
          created_at as "createdAt",
          CONCAT(first_name, ' ', last_name) as "fullName"
        FROM users
        ORDER BY created_at DESC
      `;
      
      const { rows } = await pool.query(query);
      
      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la récupération des utilisateurs',
        error: error.message 
      });
    }
  },

  // Mettre à jour le statut d'un utilisateur
  async updateUserStatus(req, res) {
    const { userId } = req.params;
    const { status } = req.body;

    try {
      // Vérifier que le statut est valide
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ 
          message: 'Statut invalide. Les valeurs acceptées sont: active, inactive' 
        });
      }

      // Vérifier que l'utilisateur existe
      const checkUser = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
      );

      if (checkUser.rows.length === 0) {
        return res.status(404).json({ 
          message: 'Utilisateur non trouvé' 
        });
      }

      // Empêcher la désactivation d'un admin
      if (checkUser.rows[0].role === 'admin' && status === 'inactive') {
        return res.status(403).json({ 
          message: 'Impossible de désactiver un compte administrateur' 
        });
      }

      // Mettre à jour le statut
      const query = `
        UPDATE users 
        SET status = $1, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING id, last_name, first_name, email, role, status
      `;
      
      const { rows } = await pool.query(query, [status, userId]);

      res.json(rows[0]);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la mise à jour du statut',
        error: error.message 
      });
    }
  },

  // Récupérer tous les professionnels avec leurs détails
  async getAllProfessionals(req, res) {
    try {
      const query = `
        SELECT 
          u.id,
          u.last_name,
          u.first_name,
          u.email,
          u.phone_number,
          u.status,
          u.availability,
          u.notes,
          u.created_at as "createdAt",
          u.last_login as "lastLogin",
          CONCAT(u.first_name, ' ', u.last_name) as "fullName",
          COUNT(DISTINCT c.id) as "totalCases",
          COUNT(DISTINCT CASE WHEN c.status = 'in_progress' THEN c.id END) as "activeCases",
          COALESCE(AVG(r.rating), 0) as "rating"
        FROM users u
        LEFT JOIN case_assignments ca ON u.id = ca.professional_id
        LEFT JOIN cases c ON ca.case_id = c.id
        LEFT JOIN ratings r ON u.id = r.professional_id
        WHERE u.role = 'pro'
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `;
      
      const { rows } = await pool.query(query);
      
      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des professionnels:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la récupération des professionnels',
        error: error.message
      });
    }
  },

  // Mettre à jour le statut d'un professionnel
  async updateProfessionalStatus(req, res) {
    const { proId } = req.params;
    const { status } = req.body;

    try {
      // Vérifier que le statut est valide
      if (!['active', 'pending', 'inactive'].includes(status)) {
        return res.status(400).json({ 
          success: false,
          message: 'Statut invalide. Les valeurs acceptées sont: active, pending, inactive' 
        });
      }

      // Vérifier que le professionnel existe
      const checkPro = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND role = \'pro\'',
        [proId]
      );

      if (checkPro.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'Professionnel non trouvé' 
        });
      }

      // Mettre à jour le statut
      const query = `
        UPDATE users 
        SET 
          status = $1, 
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 AND role = 'pro'
        RETURNING id, last_name, first_name, email, speciality, status
      `;
      
      const { rows } = await pool.query(query, [status, proId]);

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la mise à jour du statut',
        error: error.message 
      });
    }
  },

  // Obtenir les détails d'une urgence
  async getEmergencyDetails(req, res) {
    const { id } = req.params;

    try {
      const query = `
        SELECT 
          er.id,
          er.request_type as type,
          er.status,
          er.created_at as "createdAt",
          er.latitude,
          er.longitude,
          json_build_object(
            'fullName', u.last_name || ' ' || u.first_name,
            'phoneNumber', u.phone_number
          ) as user
        FROM emergency_requests er
        JOIN users u ON er.user_id = u.id
        WHERE er.id = $1
      `;

      const { rows } = await pool.query(query, [id]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Urgence non trouvée'
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'urgence:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des détails'
      });
    }
  },

  // Récupérer toutes les urgences en attente
  async getPendingEmergencies(req, res) {
    try {
      const query = `
        SELECT 
          er.id,
          er.request_type as type,
          er.status,
          er.created_at as "createdAt",
          er.latitude,
          er.longitude,
          json_build_object(
            'fullName', u.last_name || ' ' || u.first_name,
            'phoneNumber', u.phone_number
          ) as user
        FROM emergency_requests er
        JOIN users u ON er.user_id = u.id
        WHERE er.status = 'pending'
        ORDER BY er.created_at DESC
      `;

      const { rows } = await pool.query(query);

      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des urgences:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des urgences'
      });
    }
  },

  // Assigner une urgence à un professionnel
  async assignEmergency(req, res) {
    const { id } = req.params;
    const { professionalId, note } = req.body;

    if (!professionalId) {
      return res.status(400).json({
        success: false,
        message: 'ID du professionnel requis'
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Vérifier si l'urgence existe et est en attente
      const emergencyCheckQuery = `
        SELECT status 
        FROM emergency_requests 
        WHERE id = $1
      `;
      const { rows: emergencyRows } = await client.query(emergencyCheckQuery, [id]);

      if (emergencyRows.length === 0) {
        throw new Error('Urgence non trouvée');
      }

      if (emergencyRows[0].status !== 'pending') {
        throw new Error('Cette urgence est déjà assignée');
      }

      // Vérifier si le professionnel existe et est actif
      const proCheckQuery = `
        SELECT status 
        FROM users 
        WHERE id = $1 AND role = 'pro'
      `;
      const { rows: proRows } = await client.query(proCheckQuery, [professionalId]);

      if (proRows.length === 0) {
        throw new Error('Professionnel non trouvé');
      }

      if (proRows[0].status !== 'active') {
        throw new Error('Ce professionnel n\'est pas actif');
      }

      // Mettre à jour le statut de l'urgence et créer l'assignation
      const updateEmergencyQuery = `
        UPDATE emergency_requests 
        SET 
          status = 'assigned',
          professional_id = $1,
          assignment_note = $2,
          assigned_at = NOW(),
          updated_at = NOW()
        WHERE id = $3
        RETURNING id
      `;
      
      await client.query(updateEmergencyQuery, [professionalId, note, id]);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Urgence assignée avec succès'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erreur lors de l\'assignation de l\'urgence:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'assignation de l\'urgence'
      });
    } finally {
      client.release();
    }
  },

  // Mettre à jour le rôle d'un utilisateur
  async updateUserRole(req, res) {
    const { userId } = req.params;
    const { role } = req.body;

    try {
      // Vérifier que le rôle est valide
      if (!['admin', 'pro', 'user'].includes(role)) {
        return res.status(400).json({ 
          success: false,
          message: 'Rôle invalide. Les valeurs acceptées sont: admin, pro, user' 
        });
      }

      // Vérifier que l'utilisateur existe
      const checkUser = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
      );

      if (checkUser.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'Utilisateur non trouvé' 
        });
      }

      // Empêcher la modification du rôle d'un admin
      if (checkUser.rows[0].role === 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Impossible de modifier le rôle d\'un administrateur' 
        });
      }

      // Mettre à jour le rôle
      const query = `
        UPDATE users 
        SET 
          role = $1,
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING id, last_name, first_name, email, role, status
      `;
      
      const { rows } = await pool.query(query, [role, userId]);

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la mise à jour du rôle',
        error: error.message 
      });
    }
  },

  // Ajouter une note à un professionnel
  async addNote(req, res) {
    try {
      const { userId } = req.params;
      const { note } = req.body;

      // Vérifier si l'utilisateur existe et est un professionnel
      const userCheck = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'Utilisateur non trouvé' 
        });
      }

      if (userCheck.rows[0].role !== 'pro') {
        return res.status(400).json({ 
          success: false,
          message: 'L\'utilisateur n\'est pas un professionnel' 
        });
      }

      // Mettre à jour la note
      const query = `
        UPDATE users 
        SET 
          notes = $1,
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING id, notes
      `;
      
      const { rows } = await pool.query(query, [note, userId]);

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la note:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de l\'ajout de la note',
        error: error.message
      });
    }
  },

  // Mettre à jour la disponibilité d'un professionnel
  async updateAvailability(req, res) {
    try {
      const { userId } = req.params;
      const { availability } = req.body;

      // Vérifier si l'utilisateur existe et est un professionnel
      const userCheck = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'Utilisateur non trouvé' 
        });
      }

      if (userCheck.rows[0].role !== 'pro') {
        return res.status(400).json({ 
          success: false,
          message: 'L\'utilisateur n\'est pas un professionnel' 
        });
      }

      // Mettre à jour la disponibilité
      const query = `
        UPDATE users 
        SET 
          availability = $1,
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING id, availability
      `;
      
      const { rows } = await pool.query(query, [availability, userId]);

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la disponibilité:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la mise à jour de la disponibilité',
        error: error.message
      });
    }
  },

  // Obtenir les statistiques d'un professionnel
  async getProfessionalStats(req, res) {
    try {
      const { userId } = req.params;

      // Vérifier si l'utilisateur existe et est un professionnel
      const userCheck = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'Utilisateur non trouvé' 
        });
      }

      if (userCheck.rows[0].role !== 'pro') {
        return res.status(400).json({ 
          success: false,
          message: 'L\'utilisateur n\'est pas un professionnel' 
        });
      }

      // Obtenir les statistiques
      const query = `
        SELECT 
          u.id,
          u.created_at as "createdAt",
          u.last_login as "lastLogin",
          u.availability,
          COUNT(DISTINCT c.id) as "totalCases",
          COUNT(DISTINCT CASE WHEN c.status = 'in_progress' THEN c.id END) as "activeCases",
          COALESCE(AVG(r.rating), 0) as "rating"
        FROM users u
        LEFT JOIN case_assignments ca ON u.id = ca.professional_id
        LEFT JOIN cases c ON ca.case_id = c.id
        LEFT JOIN ratings r ON u.id = r.professional_id
        WHERE u.id = $1
        GROUP BY u.id
      `;
      
      const { rows } = await pool.query(query, [userId]);

      if (rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'Statistiques non trouvées' 
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message
      });
    }
  },
};

module.exports = adminController; 