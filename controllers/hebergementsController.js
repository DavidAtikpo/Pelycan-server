const { pool } = require('../config/dbConfig');

/**
 * Contrôleur pour la gestion des hébergements temporaires
 */
class HebergementsController {
    /**
     * Récupère tous les hébergements temporaires
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAllHebergements(req, res) {
        try {
            const query = `
            SELECT 
                id, 
                proprietaire_id,
                titre,
                adresse,
                code_postal,
                ville,
                type,
                capacite,
                surface,
                description,
                equipements,
                disponibilite,
                status,
                photos,
                type_hebergement,
                date_debut,
                date_fin,
                conditions_temporaire,
                created_at,
                updated_at
            FROM logements 
            WHERE disponibilite = true 
            AND permission = true
            AND type_hebergement = 'temporaire'
            AND date_debut <= CURRENT_DATE 
            AND date_fin >= CURRENT_DATE
            ORDER BY created_at DESC
        `;
            
            const result = await pool.query(query);
            
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erreur lors de la récupération des hébergements temporaires:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération des hébergements temporaires' });
        }
    }

    /**
     * Récupère un hébergement temporaire par son ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getHebergementById(req, res) {
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
                    places_disponibles, 
                    type_hebergement, 
                    duree_max_sejour,
                    public_cible,
                    conditions_acces,
                    services_inclus,
                    image_url,
                    date_creation
                FROM hebergements_temporaires 
                WHERE id = $1 AND disponible = true
            `;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Hébergement temporaire non trouvé' });
            }
            
            return res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'hébergement temporaire:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'hébergement temporaire' });
        }
    }

    /**
     * Ajoute un nouvel hébergement temporaire
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async addHebergement(req, res) {
        try {
            const { 
                nom, 
                description, 
                adresse, 
                ville, 
                codePostal, 
                placesDisponibles, 
                typeHebergement, 
                dureeMaxSejour,
                publicCible,
                conditionsAcces,
                servicesInclus,
                imageUrl
            } = req.body;
            
            // Validation des champs obligatoires
            if (!nom || !typeHebergement) {
                return res.status(400).json({ message: 'Nom et type d\'hébergement sont obligatoires' });
            }
            
            const query = `
                INSERT INTO hebergements_temporaires (
                    nom, 
                    description, 
                    adresse, 
                    ville, 
                    code_postal, 
                    places_disponibles, 
                    type_hebergement, 
                    duree_max_sejour,
                    public_cible,
                    conditions_acces,
                    services_inclus,
                    image_url,
                    disponible,
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
                placesDisponibles || 0, 
                typeHebergement, 
                dureeMaxSejour || null,
                publicCible || null,
                conditionsAcces || null,
                servicesInclus || null,
                imageUrl || null
            ];
            
            const result = await pool.query(query, values);
            
            return res.status(201).json({ 
                message: 'Hébergement temporaire ajouté avec succès', 
                id: result.rows[0].id 
            });
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'hébergement temporaire:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de l\'ajout de l\'hébergement temporaire' });
        }
    }

    /**
     * Met à jour un hébergement temporaire existant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async updateHebergement(req, res) {
        try {
            const { id } = req.params;
            const { 
                nom, 
                description, 
                adresse, 
                ville, 
                codePostal, 
                placesDisponibles, 
                typeHebergement, 
                dureeMaxSejour,
                publicCible,
                conditionsAcces,
                servicesInclus,
                imageUrl,
                disponible
            } = req.body;
            
            const query = `
                UPDATE hebergements_temporaires 
                SET 
                    nom = $1, 
                    description = $2, 
                    adresse = $3, 
                    ville = $4, 
                    code_postal = $5, 
                    places_disponibles = $6, 
                    type_hebergement = $7, 
                    duree_max_sejour = $8,
                    public_cible = $9,
                    conditions_acces = $10,
                    services_inclus = $11,
                    image_url = $12,
                    disponible = $13,
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
                placesDisponibles, 
                typeHebergement, 
                dureeMaxSejour,
                publicCible,
                conditionsAcces,
                servicesInclus,
                imageUrl,
                disponible !== undefined ? disponible : true,
                id
            ];
            
            const result = await pool.query(query, values);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Hébergement temporaire non trouvé' });
            }
            
            return res.status(200).json({ 
                message: 'Hébergement temporaire mis à jour avec succès', 
                id: result.rows[0].id 
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'hébergement temporaire:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'hébergement temporaire' });
        }
    }

    /**
     * Supprime un hébergement temporaire (désactivation)
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async deleteHebergement(req, res) {
        try {
            const { id } = req.params;
            
            // Désactivation plutôt que suppression réelle
            const query = `
                UPDATE hebergements_temporaires 
                SET 
                    disponible = false,
                    date_modification = NOW()
                WHERE id = $1
                RETURNING id
            `;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Hébergement temporaire non trouvé' });
            }
            
            return res.status(200).json({ 
                message: 'Hébergement temporaire supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'hébergement temporaire:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'hébergement temporaire' });
        }
    }
}

module.exports = HebergementsController; 