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
                    proprietaire_id,
                    adresse, 
                    type,
                    capacite,
                    description,
                    equipements,
                    disponibilite,
                    status,
                    photos,
                    created_at,
                    updated_at
                FROM logements 
                WHERE disponibilite = true 
                ORDER BY created_at DESC
            `;
            
            const result = await pool.query(query);
            
            // Transformer les résultats pour correspondre au format attendu par le client
            const logements = result.rows.map(logement => ({
                id: logement.id,
                titre: logement.type, // Utiliser le type comme titre
                description: logement.description || '',
                adresse: logement.adresse,
                type: logement.type,
                capacite: logement.capacite,
                equipements: logement.equipements || {},
                disponibilite: logement.disponibilite,
                status: logement.status,
                photos: logement.photos || [],
                dateCreation: logement.created_at,
                dateModification: logement.updated_at,
                proprietaireId: logement.proprietaire_id
            }));
            
            return res.status(200).json(logements);
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
                    proprietaire_id,
                    adresse, 
                    type,
                    capacite,
                    description,
                    equipements,
                    disponibilite,
                    status,
                    photos,
                    created_at,
                    updated_at
                FROM logements 
                WHERE id = $1
            `;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Logement non trouvé' });
            }
            
            const logement = result.rows[0];
            
            // Transformer le résultat pour correspondre au format attendu par le client
            const logementFormatted = {
                id: logement.id,
                titre: logement.type, // Utiliser le type comme titre
                description: logement.description || '',
                adresse: logement.adresse,
                type: logement.type,
                capacite: logement.capacite,
                equipements: logement.equipements || {},
                disponibilite: logement.disponibilite,
                status: logement.status,
                photos: logement.photos || [],
                dateCreation: logement.created_at,
                dateModification: logement.updated_at,
                proprietaireId: logement.proprietaire_id
            };
            
            return res.status(200).json(logementFormatted);
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
                type,
                adresse,
                capacite,
                description,
                equipements,
                disponibilite,
                photos
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
                    proprietaire_id,
                    adresse,
                    type,
                    capacite,
                    description,
                    equipements,
                    disponibilite,
                    status,
                    photos,
                    created_at,
                    updated_at
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
                RETURNING id
            `;
            
            const values = [
                userId,
                adresse,
                type,
                capacite,
                description,
                equipements || {},
                disponibilite || true,
                'disponible',
                photos || []
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
                type,
                adresse,
                capacite,
                description,
                equipements,
                disponibilite,
                status,
                photos
            } = req.body;
            
            const query = `
                UPDATE logements 
                SET 
                    type = $1,
                    adresse = $2,
                    capacite = $3,
                    description = $4,
                    equipements = $5,
                    disponibilite = $6,
                    status = $7,
                    photos = $8,
                    updated_at = NOW()
                WHERE id = $9
                RETURNING id
            `;
            
            const values = [
                type,
                adresse,
                capacite,
                description,
                equipements || {},
                disponibilite,
                status,
                photos || [],
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
                    disponibilite = false,
                    status = 'indisponible',
                    updated_at = NOW()
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