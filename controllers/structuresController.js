const { pool } = require('../config/dbConfig');

/**
 * Contrôleur pour la gestion des structures (centres d'accueil, foyers...)
 */
class StructuresController {
    /**
     * Récupère toutes les structures
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAllStructures(req, res) {
        try {
            const query = `
                SELECT 
                    id, 
                    nom, 
                    description, 
                    adresse, 
                    ville, 
                    code_postal, 
                    telephone, 
                    email, 
                    type, 
                    capacite, 
                    services,
                    horaires,
                    image_url,
                    date_creation
                FROM structures 
                WHERE actif = true
                ORDER BY nom ASC
            `;
            
            const result = await pool.query(query);
            
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erreur lors de la récupération des structures:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération des structures' });
        }
    }

    /**
     * Récupère les structures par type
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getStructuresByType(req, res) {
        try {
            const { type } = req.params;
            
            // Validation du type
            const typesValides = ['centre_accueil', 'foyer', 'centre_hebergement', 'autre'];
            if (!typesValides.includes(type)) {
                return res.status(400).json({ message: 'Type de structure invalide' });
            }
            
            const query = `
                SELECT 
                    id, 
                    nom, 
                    description, 
                    adresse, 
                    ville, 
                    code_postal, 
                    telephone, 
                    email, 
                    type, 
                    capacite, 
                    services,
                    horaires,
                    image_url,
                    date_creation
                FROM structures 
                WHERE type = $1 AND actif = true
                ORDER BY nom ASC
            `;
            
            const result = await pool.query(query, [type]);
            
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erreur lors de la récupération des structures par type:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération des structures' });
        }
    }

    /**
     * Récupère une structure par son ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getStructureById(req, res) {
        try {
            const { id } = req.params;
            
            const query = `
                SELECT 
                    id, 
                    nom, 
                    description, 
                    adresse, 
                    ville, 
                    code_postal, 
                    telephone, 
                    email, 
                    type, 
                    capacite, 
                    services,
                    horaires,
                    image_url,
                    date_creation
                FROM structures 
                WHERE id = $1 AND actif = true
            `;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Structure non trouvée' });
            }
            
            return res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Erreur lors de la récupération de la structure:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la structure' });
        }
    }

    /**
     * Ajoute une nouvelle structure
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async addStructure(req, res) {
        try {
            const { 
                nom, 
                description, 
                adresse, 
                ville, 
                codePostal, 
                telephone, 
                email, 
                type, 
                capacite, 
                services,
                horaires,
                imageUrl 
            } = req.body;
            
            // Validation des champs obligatoires
            if (!nom || !type) {
                return res.status(400).json({ message: 'Nom et type sont obligatoires' });
            }
            
            const query = `
                INSERT INTO structures (
                    nom, 
                    description, 
                    adresse, 
                    ville, 
                    code_postal, 
                    telephone, 
                    email, 
                    type, 
                    capacite, 
                    services,
                    horaires,
                    image_url,
                    actif,
                    date_creation
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, NOW())
                RETURNING id
            `;
            
            const values = [
                nom, 
                description || null, 
                adresse || null, 
                ville || null, 
                codePostal || null, 
                telephone || null, 
                email || null, 
                type, 
                capacite || null, 
                services || null,
                horaires || null,
                imageUrl || null
            ];
            
            const result = await pool.query(query, values);
            
            return res.status(201).json({ 
                message: 'Structure ajoutée avec succès', 
                id: result.rows[0].id 
            });
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la structure:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de l\'ajout de la structure' });
        }
    }

    /**
     * Met à jour une structure existante
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async updateStructure(req, res) {
        try {
            const { id } = req.params;
            const { 
                nom, 
                description, 
                adresse, 
                ville, 
                codePostal, 
                telephone, 
                email, 
                type, 
                capacite, 
                services,
                horaires,
                imageUrl,
                actif
            } = req.body;
            
            const query = `
                UPDATE structures 
                SET 
                    nom = $1, 
                    description = $2, 
                    adresse = $3, 
                    ville = $4, 
                    code_postal = $5, 
                    telephone = $6, 
                    email = $7, 
                    type = $8, 
                    capacite = $9, 
                    services = $10,
                    horaires = $11,
                    image_url = $12,
                    actif = $13,
                    date_modification = NOW()
                WHERE id = $14
                RETURNING id
            `;
            
            const values = [
                nom, 
                description, 
                adresse, 
                ville, 
                codePostal, 
                telephone, 
                email, 
                type, 
                capacite, 
                services,
                horaires,
                imageUrl,
                actif !== undefined ? actif : true,
                id
            ];
            
            const result = await pool.query(query, values);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Structure non trouvée' });
            }
            
            return res.status(200).json({ 
                message: 'Structure mise à jour avec succès', 
                id: result.rows[0].id 
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la structure:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la structure' });
        }
    }

    /**
     * Supprime une structure (désactivation)
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async deleteStructure(req, res) {
        try {
            const { id } = req.params;
            
            // Désactivation plutôt que suppression réelle
            const query = `
                UPDATE structures 
                SET 
                    actif = false,
                    date_modification = NOW()
                WHERE id = $1
                RETURNING id
            `;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Structure non trouvée' });
            }
            
            return res.status(200).json({ 
                message: 'Structure supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de la structure:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la suppression de la structure' });
        }
    }
}

module.exports = StructuresController; 