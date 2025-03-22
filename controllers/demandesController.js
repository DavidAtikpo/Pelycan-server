const { pool } = require('../config/dbConfig');

/**
 * Contrôleur pour la gestion des demandes de logement et d'hébergement
 */
class DemandesController {
    /**
     * Récupère toutes les demandes
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAllDemandes(req, res) {
        try {
            const query = `
                SELECT 
                    id, 
                    nom, 
                    prenom, 
                    telephone, 
                    email, 
                    nombre_personnes, 
                    niveau_urgence, 
                    message, 
                    logement_id, 
                    centre_type, 
                    type,
                    status,
                    date_creation
                FROM demandes 
                ORDER BY date_creation DESC
            `;
            
            const result = await pool.query(query);
            
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erreur lors de la récupération des demandes:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération des demandes' });
        }
    }

    /**
     * Récupère les demandes par type (logement ou hébergement)
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getDemandesByType(req, res) {
        try {
            const { type } = req.params;
            
            if (type !== 'logement' && type !== 'hebergement' && type !== 'ht') {
                return res.status(400).json({ message: 'Type de demande invalide' });
            }
            
            const query = `
                SELECT 
                    id, 
                    nom, 
                    prenom, 
                    telephone, 
                    email, 
                    nombre_personnes, 
                    niveau_urgence, 
                    message, 
                    logement_id, 
                    centre_type, 
                    type,
                    status,
                    date_creation
                FROM demandes 
                WHERE type = $1
                ORDER BY date_creation DESC
            `;
            
            const result = await pool.query(query, [type]);
            
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erreur lors de la récupération des demandes par type:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération des demandes' });
        }
    }

    /**
     * Récupère une demande par son ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getDemandeById(req, res) {
        try {
            const { id } = req.params;
            
            const query = `
                SELECT 
                    id, 
                    nom, 
                    prenom, 
                    telephone, 
                    email, 
                    nombre_personnes, 
                    niveau_urgence, 
                    message, 
                    logement_id, 
                    centre_type, 
                    type,
                    status,
                    date_creation
                FROM demandes 
                WHERE id = $1
            `;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Demande non trouvée' });
            }
            
            return res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Erreur lors de la récupération de la demande:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la demande' });
        }
    }

    /**
     * Ajoute une nouvelle demande
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async addDemande(req, res) {
        try {
            const { 
                nom, 
                prenom, 
                telephone, 
                email, 
                nombrePersonnes, 
                niveauUrgence, 
                message, 
                logementId,
                hebergementId, 
                centreType, 
                type 
            } = req.body;
            
            // Validation des champs obligatoires
            if (!nom || !prenom || !telephone || !type) {
                return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires' });
            }
            
            const query = `
                INSERT INTO demandes (
                    nom, 
                    prenom, 
                    telephone, 
                    email, 
                    nombre_personnes, 
                    niveau_urgence, 
                    message, 
                    logement_id,
                    hebergement_id, 
                    centre_type, 
                    type,
                    status,
                    date_creation
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'en_attente', NOW())
                RETURNING id
            `;
            
            const values = [
                nom, 
                prenom, 
                telephone, 
                email || null, 
                nombrePersonnes || null, 
                niveauUrgence || null, 
                message || null, 
                logementId || null,
                hebergementId || null, 
                centreType || null, 
                type
            ];
            
            console.log('Données de la demande à insérer:', {
                nom, prenom, telephone, email, nombrePersonnes, niveauUrgence, message,
                logementId, hebergementId, centreType, type
            });
            
            const result = await pool.query(query, values);
            
            return res.status(201).json({ 
                message: 'Demande enregistrée avec succès', 
                id: result.rows[0].id 
            });
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la demande:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de l\'ajout de la demande' });
        }
    }

    /**
     * Met à jour le statut d'une demande
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async updateDemandeStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            // Validation du statut
            const statusValides = ['en_attente', 'en_cours', 'acceptee', 'refusee', 'annulee'];
            if (!statusValides.includes(status)) {
                return res.status(400).json({ message: 'Statut de demande invalide' });
            }
            
            const query = `
                UPDATE demandes 
                SET 
                    status = $1,
                    date_modification = NOW()
                WHERE id = $2
                RETURNING id
            `;
            
            const result = await pool.query(query, [status, id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Demande non trouvée' });
            }
            
            return res.status(200).json({ 
                message: 'Statut de la demande mis à jour avec succès',
                id: result.rows[0].id
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut de la demande:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la demande' });
        }
    }

    /**
     * Supprime une demande
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async deleteDemande(req, res) {
        try {
            const { id } = req.params;
            
            const query = `
                DELETE FROM demandes 
                WHERE id = $1
                RETURNING id
            `;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Demande non trouvée' });
            }
            
            return res.status(200).json({ 
                message: 'Demande supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de la demande:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la suppression de la demande' });
        }
    }
}

module.exports = DemandesController; 