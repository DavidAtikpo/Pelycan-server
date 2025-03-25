const { Pool } = require('pg');
const pool = new Pool({
    user: 'dbpelycan_user',
    host: 'dpg-cvgggiqqgecs739eos30-a.oregon-postgres.render.com',
    database: 'dbpelycan',
    password: 'r7ZmNPPJoulWXb3CgJ9BgcDpagwjfJKp',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});



const createAlert = async (req, res) => {
    try {
        const { location } = req.body;
        const userId = req.user.id;
        const userName = req.user.name || req.user.email;

        // Vérifier que les données requises sont présentes
        if (!location || !location.latitude || !location.longitude) {
            return res.status(400).json({
                message: 'Les coordonnées de localisation sont requises'
            });
        }

        const query = `
            INSERT INTO alerts (
                user_id,
                user_name,
                latitude,
                longitude,
                accuracy,
                status,
                messages
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            userId,
            userName,
            location.latitude,
            location.longitude,
            location.accuracy || null,
            'active',
            '[]'
        ];

        const result = await pool.query(query, values);
        const alert = result.rows[0];

        // Formater la réponse pour correspondre à l'interface AlertData
        const formattedAlert = {
            id: alert.id,
            userId: alert.user_id,
            userName: alert.user_name,
            location: {
                latitude: alert.latitude,
                longitude: alert.longitude,
                accuracy: alert.accuracy
            },
            timestamp: alert.timestamp,
            status: alert.status,
            created_at: alert.created_at,
            updated_at: alert.updated_at,
            viewed_by_admin: alert.viewed_by_admin
        };

        res.status(201).json({
            message: 'Alerte créée avec succès',
            data: formattedAlert
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'alerte:', error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'alerte' });
    }
};

const getAlerts = async (req, res) => {
    try {
        const query = `
            SELECT 
                a.*,
                u.email as user_email
            FROM alerts a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.timestamp DESC
        `;

        const result = await pool.query(query);
        const alerts = result.rows.map(alert => ({
            id: alert.id,
            userId: alert.user_id,
            userName: alert.user_name,
            location: {
                latitude: parseFloat(alert.latitude),
                longitude: parseFloat(alert.longitude),
                accuracy: parseFloat(alert.accuracy) || null
            },
            timestamp: alert.timestamp,
            status: alert.status
        }));

        res.json({ alerts });
    } catch (error) {
        console.error('Erreur lors de la récupération des alertes:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des alertes' });
    }
};

const getActiveAlerts = async (req, res) => {
    try {
        const query = `
            SELECT id, viewed_by_admin
            FROM alerts 
            WHERE status = 'active'
            ORDER BY timestamp DESC
            LIMIT 1
        `;

        const result = await pool.query(query);
        const latestAlert = result.rows[0];

        res.json({
            hasActiveAlerts: !!latestAlert,
            alertId: latestAlert ? latestAlert.id : null,
            viewed: latestAlert ? latestAlert.viewed_by_admin : false
        });
    } catch (error) {
        console.error('Erreur lors de la vérification des alertes:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la vérification des alertes' });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { alertId } = req.params;
        const { message } = req.body;
        const adminId = req.user.id;

        const checkQuery = 'SELECT messages FROM alerts WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [alertId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Alerte non trouvée' });
        }

        const currentMessages = checkResult.rows[0].messages || [];
        const newMessage = {
            text: message,
            senderId: adminId,
            timestamp: new Date()
        };

        const updateQuery = `
            UPDATE alerts
            SET messages = $1
            WHERE id = $2
            RETURNING *
        `;

        await pool.query(updateQuery, [
            JSON.stringify([...currentMessages, newMessage]),
            alertId
        ]);

        res.json({ message: 'Message envoyé avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
    }
};

const processAlert = async (req, res) => {
    try {
        const { alertId } = req.params;

        const query = `
            UPDATE alerts
            SET status = 'processed'
            WHERE id = $1
            RETURNING *
        `;

        const result = await pool.query(query, [alertId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Alerte non trouvée' });
        }

        res.json({ message: 'Alerte marquée comme traitée' });
    } catch (error) {
        console.error('Erreur lors du traitement de l\'alerte:', error);
        res.status(500).json({ message: 'Erreur lors du traitement de l\'alerte' });
    }
};

const markAlertAsViewed = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            UPDATE alerts 
            SET viewed_by_admin = true 
            WHERE id = $1 
            RETURNING *
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Alerte non trouvée' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erreur lors du marquage de l\'alerte comme vue:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = {
    createAlert,
    getAlerts,
    getActiveAlerts,
    sendMessage,
    processAlert,
    markAlertAsViewed
}; 