const { pool } = require('../config/dbConfig');

/**
 * Contrôleur pour la gestion des logements
 */
class LogementsController {
    /**
     * Récupère tous les logements disponibles
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAllLogements(req, res) {
        try {
            const query = `
                SELECT 
                    id, 
                    titre, 
                    description, 
                    adresse, 
                    ville, 
                    code_postal, 
                    nombre_pieces, 
                    superficie, 
                    loyer, 
                    charges, 
                    disponibilite, 
                    type_logement,
                    image_url
                FROM logements 
                WHERE disponible = true 
                ORDER BY date_creation DESC
            `;
            
            const result = await pool.query(query);
            
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erreur lors de la récupération des logements:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération des logements' });
        }
    }

    /**
     * Récupère un logement par son ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getLogementById(req, res) {
        try {
            const { id } = req.params;
            
            const query = `
                SELECT 
                    id, 
                    titre, 
                    description, 
                    adresse, 
                    ville, 
                    code_postal, 
                    nombre_pieces, 
                    superficie, 
                    loyer, 
                    charges, 
                    disponibilite, 
                    type_logement,
                    image_url
                FROM logements 
                WHERE id = $1
            `;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Logement non trouvé' });
            }
            
            return res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Erreur lors de la récupération du logement:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération du logement' });
        }
    }

    /**
     * Ajoute un nouveau logement (pour les professionnels ou administrateurs)
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async addLogement(req, res) {
        try {
            const { 
                titre, 
                description, 
                adresse, 
                ville, 
                code_postal, 
                nombre_pieces, 
                superficie, 
                loyer, 
                charges, 
                disponibilite, 
                type_logement,
                image_url,
                equipements,
                images  // Nouveau champ pour stocker plusieurs URLs d'images
            } = req.body;
            
            console.log('Données reçues pour l\'ajout d\'un logement:', req.body);
            
            // Récupérer l'ID de l'utilisateur à partir du token JWT décodé
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Utilisateur non authentifié ou ID utilisateur manquant' });
            }
            
            // Insertion du logement
            const query = `
                INSERT INTO logements (
                    titre, 
                    description, 
                    adresse, 
                    ville, 
                    code_postal, 
                    nombre_pieces, 
                    superficie, 
                    loyer, 
                    charges, 
                    disponibilite, 
                    type_logement,
                    image_url,
                    equipements,
                    images,
                    disponible,
                    date_creation,
                    user_id
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, NOW(), $15)
                RETURNING id
            `;
            
            // Si images est fourni et est un tableau, le convertir en JSON stringifié
            const imagesValue = images && Array.isArray(images) ? JSON.stringify(images) : null;
            
            const values = [
                titre, 
                description, 
                adresse, 
                ville, 
                code_postal, 
                nombre_pieces, 
                superficie, 
                loyer, 
                charges, 
                disponibilite, 
                type_logement,
                image_url,
                equipements,
                imagesValue,
                userId  // Utiliser l'ID de l'utilisateur authentifié
            ];
            
            const result = await pool.query(query, values);
            
            return res.status(201).json({ 
                message: 'Logement ajouté avec succès', 
                id: result.rows[0].id 
            });
        } catch (error) {
            console.error('Erreur lors de l\'ajout du logement:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du logement', error: error.message });
        }
    }

    /**
     * Met à jour un logement existant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async updateLogement(req, res) {
        try {
            const { id } = req.params;
            const { 
                titre, 
                description, 
                adresse, 
                ville, 
                code_postal, 
                nombre_pieces, 
                superficie, 
                loyer, 
                charges, 
                disponibilite, 
                type_logement,
                image_url,
                disponible
            } = req.body;
            
            const query = `
                UPDATE logements 
                SET 
                    titre = $1, 
                    description = $2, 
                    adresse = $3, 
                    ville = $4, 
                    code_postal = $5, 
                    nombre_pieces = $6, 
                    superficie = $7, 
                    loyer = $8, 
                    charges = $9, 
                    disponibilite = $10, 
                    type_logement = $11,
                    image_url = $12,
                    disponible = $13,
                    date_modification = NOW()
                WHERE id = $14
                RETURNING id
            `;
            
            const values = [
                titre, 
                description, 
                adresse, 
                ville, 
                code_postal, 
                nombre_pieces, 
                superficie, 
                loyer, 
                charges, 
                disponibilite, 
                type_logement,
                image_url,
                disponible,
                id
            ];
            
            const result = await pool.query(query, values);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Logement non trouvé' });
            }
            
            return res.status(200).json({ 
                message: 'Logement mis à jour avec succès', 
                id: result.rows[0].id 
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du logement:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du logement' });
        }
    }

    /**
     * Supprime un logement
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async deleteLogement(req, res) {
        try {
            const { id } = req.params;
            
            // Plutôt que de supprimer réellement, on désactive le logement
            const query = `
                UPDATE logements 
                SET 
                    disponible = false,
                    date_modification = NOW()
                WHERE id = $1
                RETURNING id
            `;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Logement non trouvé' });
            }
            
            return res.status(200).json({ 
                message: 'Logement supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du logement:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la suppression du logement' });
        }
    }
}

module.exports = LogementsController; 