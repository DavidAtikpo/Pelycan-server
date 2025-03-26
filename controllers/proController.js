const { pool } = require('../config/dbConfig');

const proController = {
    // Obtenir les statistiques du tableau de bord
    async getDashboardStats(req, res) {
        try {
            const proId = req.user.id;
            
            // Requête pour les statistiques des cas
            const statsQuery = `
                SELECT
                    COUNT(CASE WHEN c.status = 'in_progress' THEN 1 END) as active_cases,
                    COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as completed_cases
                FROM cases c
                INNER JOIN case_assignments ca ON c.id = ca.case_id
                WHERE ca.professional_id = $1
            `;

            // Requête pour les urgences
            const emergencyQuery = `
                SELECT COUNT(*) as pending_emergencies
                FROM emergency_requests er
                WHERE er.professional_id = $1 
                AND er.status IN ('pending', 'assigned', 'in_progress')
            `;

            const [caseStats, emergencyStats] = await Promise.all([
                pool.query(statsQuery, [proId]),
                pool.query(emergencyQuery, [proId])
            ]);
            
            res.json({
                success: true,
                activeCases: parseInt(caseStats.rows[0]?.active_cases || '0'),
                completedCases: parseInt(caseStats.rows[0]?.completed_cases || '0'),
                pendingEmergencies: parseInt(emergencyStats.rows[0]?.pending_emergencies || '0')
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques'
            });
        }
    },

    // Obtenir les cas actifs
    async getActiveCases(req, res) {
        try {
            const proId = req.user.id;
            
            const query = `
                SELECT 
                    c.id,
                    c.title,
                    c.description,
                    c.status,
                    c.priority,
                    c.created_at,
                    c.updated_at,
                    u.full_name as client_name,
                    u.phone_number as client_phone
                FROM cases c
                INNER JOIN case_assignments ca ON c.id = ca.case_id
                INNER JOIN users u ON c.client_id = u.id
                WHERE ca.professional_id = $1
                AND c.status = 'in_progress'
                ORDER BY 
                    CASE 
                        WHEN c.priority = 'high' THEN 1
                        WHEN c.priority = 'medium' THEN 2
                        ELSE 3
                    END,
                    c.created_at DESC`;

            const result = await pool.query(query, [proId]);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des cas actifs:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des cas actifs'
            });
        }
    },

    // Obtenir les cas complétés
    async getCompletedCases(req, res) {
        try {
            const proId = req.user.id;
            
            const query = `
                SELECT 
                    c.id,
                    c.title,
                    c.description,
                    c.status,
                    c.priority,
                    c.created_at,
                    c.completed_at,
                    u.full_name as client_name
                FROM cases c
                INNER JOIN case_assignments ca ON c.id = ca.case_id
                INNER JOIN users u ON c.client_id = u.id
                WHERE ca.professional_id = $1
                AND c.status = 'completed'
                ORDER BY c.completed_at DESC`;

            const result = await pool.query(query, [proId]);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des cas complétés:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des cas complétés'
            });
        }
    },

    // Obtenir les détails d'un cas
    async getCaseDetails(req, res) {
        try {
            const { id } = req.params;
            const proId = req.user.id;

            const query = `
                SELECT 
                    c.*,
                    u.full_name as client_name,
                    u.email as client_email,
                    u.phone_number as client_phone,
                    json_agg(
                        json_build_object(
                            'id', cn.id,
                            'content', cn.content,
                            'created_at', cn.created_at
                        ) ORDER BY cn.created_at DESC
                    ) as notes
                FROM cases c
                INNER JOIN case_assignments ca ON c.id = ca.case_id
                INNER JOIN users u ON c.client_id = u.id
                LEFT JOIN case_notes cn ON c.id = cn.case_id
                WHERE c.id = $1 AND ca.professional_id = $2
                GROUP BY c.id, u.full_name, u.email, u.phone_number`;

            const result = await pool.query(query, [id, proId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Cas non trouvé ou non autorisé'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des détails du cas:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des détails du cas'
            });
        }
    },

    // Mettre à jour le statut d'un cas
    async updateCaseStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;
        const proId = req.user.id;

        try {
            const query = `
                UPDATE cases c
                SET 
                    status = $1,
                    updated_at = NOW(),
                    completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE completed_at END
                FROM case_assignments ca
                WHERE c.id = $2 
                AND ca.case_id = c.id 
                AND ca.professional_id = $3
                RETURNING c.*`;

            const result = await pool.query(query, [status, id, proId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Cas non trouvé ou non autorisé'
                });
            }

            res.json({
                success: true,
                message: 'Statut du cas mis à jour avec succès',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du statut'
            });
        }
    },

    // Ajouter une note à un cas
    async addCaseNote(req, res) {
        const { id } = req.params;
        const { content } = req.body;
        const proId = req.user.id;

        try {
            // Vérifier l'accès au cas
            const checkAccess = await pool.query(
                'SELECT 1 FROM case_assignments WHERE case_id = $1 AND professional_id = $2',
                [id, proId]
            );

            if (checkAccess.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé à ce cas'
                });
            }

            const query = `
                INSERT INTO case_notes (case_id, professional_id, content, created_at)
                VALUES ($1, $2, $3, NOW())
                RETURNING id, content, created_at`;

            const result = await pool.query(query, [id, proId, content]);

            res.json({
                success: true,
                message: 'Note ajoutée avec succès',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la note:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'ajout de la note'
            });
        }
    },

    // Obtenir le profil du professionnel
    async getProfile(req, res) {
        try {
            const proId = req.user.id;
            
            const query = `
                SELECT 
                    id,
                    last_name,
                    first_name,
                    email,
                    phone_number,
                    speciality,
                    bio,
                    created_at,
                    updated_at
                FROM users
                WHERE id = $1 AND role = 'pro'`;

            const result = await pool.query(query, [proId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil non trouvé'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du profil'
            });
        }
    },

    // Mettre à jour le profil du professionnel
    async updateProfile(req, res) {
        const proId = req.user.id;
        const { last_name, first_name, phone_number, speciality, bio } = req.body;

        try {
            const query = `
                UPDATE users
                SET 
                    last_name = COALESCE($1, last_name),
                    first_name = COALESCE($2, first_name),
                    phone_number = COALESCE($3, phone_number),
                    speciality = COALESCE($4, speciality),
                    bio = COALESCE($5, bio),
                    updated_at = NOW()
                WHERE id = $6 AND role = 'pro'
                RETURNING id, last_name, first_name, email, phone_number, speciality, bio`;

            const result = await pool.query(query, [
                last_name,
                first_name,
                phone_number,
                speciality,
                bio,
                proId
            ]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil non trouvé'
                });
            }

            res.json({
                success: true,
                message: 'Profil mis à jour avec succès',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du profil'
            });
        }
    },

    // Obtenir les cas récents
    async getRecentCases(req, res) {
        try {
            const proId = req.user.id;
            
            const query = `
                (
                    -- Cas normaux
                    SELECT 
                        c.id,
                        c.title,
                        c.status,
                        c.priority,
                        c.type,
                        c.created_at as "createdAt",
                        false as "isEmergency"
                    FROM cases c
                    INNER JOIN case_assignments ca ON c.id = ca.case_id
                    WHERE ca.professional_id = $1
                )
                UNION ALL
                (
                    -- Cas d'urgence
                    SELECT 
                        er.id,
                        er.request_type as title,
                        er.status,
                        'high' as priority,
                        er.request_type as type,
                        er.created_at as "createdAt",
                        true as "isEmergency"
                    FROM emergency_requests er
                    WHERE er.professional_id = $1
                )
                ORDER BY "createdAt" DESC
                LIMIT 5
            `;

            const result = await pool.query(query, [proId]);
            
            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des cas récents:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des cas récents'
            });
        }
    }
};

module.exports = proController; 