const { pool } = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

const emergencyController = {
    // Créer une nouvelle demande d'urgence
    async createEmergencyRequest(req, res) {
        const { userId, location, timestamp, type } = req.body;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Insérer la demande d'urgence
            const emergencyQuery = `
                INSERT INTO emergency_requests (
                    id,
                    user_id,
                    latitude,
                    longitude,
                    request_type,
                    created_at,
                    updated_at,
                    status
                ) VALUES (
                    uuid_generate_v4(),
                    $1, $2, $3, $4, $5, $5, 'pending'
                )
                RETURNING id
            `;

            const emergencyValues = [
                userId,
                location.latitude,
                location.longitude,
                type,
                timestamp
            ];

            const { rows: [emergency] } = await client.query(emergencyQuery, emergencyValues);

            // Notifier les professionnels disponibles
            const notifyQuery = `
                INSERT INTO emergency_notifications (
                    id,
                    emergency_id,
                    user_id,
                    type,
                    content,
                    created_at,
                    updated_at
                )
                SELECT 
                    uuid_generate_v4(),
                    $1,
                    u.id,
                    'emergency_request',
                    'Nouvelle demande d''urgence',
                    NOW(),
                    NOW()
                FROM users u
                WHERE u.role = 'pro'
                AND u.status = 'active'
                AND (u.last_login IS NULL OR u.last_login > NOW() - INTERVAL '15 minutes')
            `;

            await client.query(notifyQuery, [emergency.id]);

            // Créer une entrée dans le journal des urgences
            const logQuery = `
                INSERT INTO emergency_logs (
                    id,
                    emergency_id,
                    action,
                    details,
                    performed_by,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            `;

            await client.query(logQuery, [
                uuidv4(),
                emergency.id,
                'created',
                JSON.stringify({ status: 'pending' }),
                userId
            ]);

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Demande d\'urgence enregistrée',
                data: {
                    emergencyId: emergency.id
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la création de la demande d\'urgence:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de la demande d\'urgence'
            });
        } finally {
            client.release();
        }
    },

    // Obtenir le statut d'une demande d'urgence
    async getEmergencyStatus(req, res) {
        const { emergencyId } = req.params;

        try {
            const query = `
                SELECT 
                    er.*,
                    json_agg(
                        json_build_object(
                            'id', el.id,
                            'action', el.action,
                            'details', el.details,
                            'created_at', el.created_at
                        ) ORDER BY el.created_at DESC
                    ) as logs
                FROM emergency_requests er
                LEFT JOIN emergency_logs el ON er.id = el.emergency_id
                WHERE er.id = $1
                GROUP BY er.id
            `;

            const { rows } = await pool.query(query, [emergencyId]);

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Demande d\'urgence non trouvée'
                });
            }

            res.json({
                success: true,
                data: rows[0]
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du statut:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du statut'
            });
        }
    },

    // Mettre à jour le statut d'une demande d'urgence
    async updateEmergencyStatus(req, res) {
        const { emergencyId } = req.params;
        const { status, details } = req.body;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Mettre à jour le statut
            const updateQuery = `
                UPDATE emergency_requests
                SET 
                    status = $1,
                    updated_at = NOW()
                WHERE id = $2
                RETURNING *
            `;

            const { rows } = await client.query(updateQuery, [status, emergencyId]);

            if (rows.length === 0) {
                throw new Error('Demande d\'urgence non trouvée');
            }

            // Ajouter une entrée dans les logs
            const logQuery = `
                INSERT INTO emergency_logs (
                    id,
                    emergency_id,
                    action,
                    details,
                    performed_by,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            `;

            await client.query(logQuery, [
                uuidv4(),
                emergencyId,
                'status_updated',
                JSON.stringify({ status, details: details || `Statut mis à jour: ${status}` }),
                req.user.id
            ]);

            await client.query('COMMIT');

            res.json({
                success: true,
                message: 'Statut mis à jour avec succès',
                data: rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la mise à jour du statut:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la mise à jour du statut'
            });
        } finally {
            client.release();
        }
    },

    // Récupérer l'historique des demandes d'urgence d'un utilisateur
    async getEmergencyHistory(req, res) {
        const { userId } = req.params;

        try {
            const query = `
                SELECT 
                    er.id,
                    er.request_type,
                    er.status,
                    er.created_at,
                    er.updated_at,
                    json_agg(
                        json_build_object(
                            'id', el.id,
                            'action', el.action,
                            'details', el.details,
                            'created_at', el.created_at
                        ) ORDER BY el.created_at DESC
                    ) as logs
                FROM emergency_requests er
                LEFT JOIN emergency_logs el ON er.id = el.emergency_id
                WHERE er.user_id = $1
                GROUP BY er.id, er.request_type, er.status, er.created_at, er.updated_at
                ORDER BY er.created_at DESC
            `;

            const { rows } = await pool.query(query, [userId]);

            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de l\'historique'
            });
        }
    }
};

module.exports = emergencyController; 