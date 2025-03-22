const { pool } = require('../config/dbConfig');

/**
 * Contrôleur pour la gestion des messages envoyés aux structures
 */
class MessagesController {
    /**
     * Récupère tous les messages
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAllMessages(req, res) {
        try {
            const query = `
                SELECT 
                    id, 
                    structure_id, 
                    message, 
                    date, 
                    lu, 
                    date_creation
                FROM messages 
                ORDER BY date_creation DESC
            `;
            
            const result = await pool.query(query);
            
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erreur lors de la récupération des messages:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération des messages' });
        }
    }

    /**
     * Récupère les messages pour une structure spécifique
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getMessagesByStructure(req, res) {
        try {
            const { structureId } = req.params;
            
            const query = `
                SELECT 
                    id, 
                    structure_id, 
                    message, 
                    date, 
                    lu, 
                    date_creation
                FROM messages 
                WHERE structure_id = $1
                ORDER BY date_creation DESC
            `;
            
            const result = await pool.query(query, [structureId]);
            
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erreur lors de la récupération des messages de la structure:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération des messages' });
        }
    }

    /**
     * Récupère un message par son ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getMessageById(req, res) {
        try {
            const { id } = req.params;
            
            const query = `
                SELECT 
                    id, 
                    structure_id, 
                    message, 
                    date, 
                    lu, 
                    date_creation
                FROM messages 
                WHERE id = $1
            `;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Message non trouvé' });
            }
            
            return res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Erreur lors de la récupération du message:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération du message' });
        }
    }

    /**
     * Ajoute un nouveau message
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async addMessage(req, res) {
        try {
            const { structureId, message, date } = req.body;
            
            // Validation des champs obligatoires
            if (!structureId || !message) {
                return res.status(400).json({ message: 'Structure et message sont obligatoires' });
            }
            
            // Vérification que la structure existe
            const structureCheck = await pool.query(
                'SELECT id FROM structures WHERE id = $1',
                [structureId]
            );
            
            if (structureCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Structure non trouvée' });
            }
            
            const query = `
                INSERT INTO messages (
                    structure_id, 
                    message, 
                    date, 
                    lu, 
                    date_creation
                ) 
                VALUES ($1, $2, $3, false, NOW())
                RETURNING id
            `;
            
            const values = [
                structureId, 
                message, 
                date || new Date()
            ];
            
            const result = await pool.query(query, values);
            
            return res.status(201).json({ 
                message: 'Message envoyé avec succès', 
                id: result.rows[0].id 
            });
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de l\'envoi du message' });
        }
    }

    /**
     * Marque un message comme lu ou non lu
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async updateMessageLu(req, res) {
        try {
            const { id } = req.params;
            const { lu } = req.body;
            
            // Validation du paramètre lu
            if (lu === undefined) {
                return res.status(400).json({ message: 'Le paramètre lu est obligatoire' });
            }
            
            const query = `
                UPDATE messages 
                SET 
                    lu = $1,
                    date_modification = NOW()
                WHERE id = $2
                RETURNING id
            `;
            
            const result = await pool.query(query, [lu, id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Message non trouvé' });
            }
            
            return res.status(200).json({ 
                message: lu ? 'Message marqué comme lu' : 'Message marqué comme non lu',
                id: result.rows[0].id
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut de lecture du message:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du message' });
        }
    }

    /**
     * Supprime un message
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async deleteMessage(req, res) {
        try {
            const { id } = req.params;
            
            const query = `
                DELETE FROM messages 
                WHERE id = $1
                RETURNING id
            `;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Message non trouvé' });
            }
            
            return res.status(200).json({ 
                message: 'Message supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du message:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la suppression du message' });
        }
    }
}

module.exports = MessagesController; 