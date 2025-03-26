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
                AND (type_hebergement = 'permanent' 
                    OR (type_hebergement = 'temporaire' 
                        AND date_debut <= CURRENT_DATE 
                        AND date_fin >= CURRENT_DATE))
                ORDER BY created_at DESC
            `;
            
            const result = await pool.query(query);
            
            // Transformer les résultats pour correspondre au format attendu par le client
            const logements = result.rows.map(logement => ({
                id: logement.id,
                titre: logement.titre,
                description: logement.description || '',
                adresse: logement.adresse,
                codePostal: logement.code_postal,
                ville: logement.ville,
                type: logement.type,
                capacite: logement.capacite,
                surface: logement.surface,
                equipements: logement.equipements || {},
                disponibilite: logement.disponibilite,
                status: logement.status,
                photos: logement.photos || [],
                typeHebergement: logement.type_hebergement,
                dateDebut: logement.date_debut,
                dateFin: logement.date_fin,
                conditionsTemporaire: logement.conditions_temporaire,
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
                titre: logement.titre,
                description: logement.description || '',
                adresse: logement.adresse,
                codePostal: logement.code_postal,
                ville: logement.ville,
                type: logement.type,
                capacite: logement.capacite,
                surface: logement.surface,
                equipements: logement.equipements || {},
                disponibilite: logement.disponibilite,
                status: logement.status,
                photos: logement.photos || [],
                typeHebergement: logement.type_hebergement,
                dateDebut: logement.date_debut,
                dateFin: logement.date_fin,
                conditionsTemporaire: logement.conditions_temporaire,
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
     * Ajoute un nouveau logement
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
                images
            } = req.body;
            
            console.log('Données reçues pour l\'ajout d\'un logement:', req.body);
            
            // Récupérer l'ID de l'utilisateur à partir du token JWT décodé
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Utilisateur non authentifié ou ID utilisateur manquant' });
            }

            // Convertir les équipements en format JSONB
            let equipementsJson = {};
            if (typeof equipements === 'string') {
                // Si c'est une chaîne de caractères, la convertir en objet
                equipementsJson = equipements.split(',').reduce((acc, equipement) => {
                    acc[equipement.trim()] = true;
                    return acc;
                }, {});
            } else if (typeof equipements === 'object' && equipements !== null) {
                // Si c'est déjà un objet, l'utiliser directement
                equipementsJson = equipements;
            }
            
            // Insertion du logement
            const query = `
                INSERT INTO logements (
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
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
                RETURNING id
            `;
            
            const values = [
                userId,
                titre,
                adresse,
                code_postal,
                ville,
                type_logement,
                nombre_pieces,
                superficie,
                description,
                equipementsJson,
                true, // disponibilite est toujours true pour un nouveau logement
                'disponible',
                images || [],
                'permanent',
                null,
                null,
                null
            ];
            
            console.log('Valeurs à insérer:', values);
            
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
                adresse,
                codePostal,
                ville,
                type,
                capacite,
                surface,
                description,
                equipements,
                disponibilite,
                status,
                photos,
                typeHebergement,
                dateDebut,
                dateFin,
                conditionsTemporaire
            } = req.body;
            
            const query = `
                UPDATE logements 
                SET 
                    titre = $1,
                    adresse = $2,
                    code_postal = $3,
                    ville = $4,
                    type = $5,
                    capacite = $6,
                    surface = $7,
                    description = $8,
                    equipements = $9,
                    disponibilite = $10,
                    status = $11,
                    photos = $12,
                    type_hebergement = $13,
                    date_debut = $14,
                    date_fin = $15,
                    conditions_temporaire = $16,
                    updated_at = NOW()
                WHERE id = $17
                RETURNING id
            `;
            
            const values = [
                titre,
                adresse,
                codePostal,
                ville,
                type,
                capacite,
                surface,
                description,
                equipements || {},
                disponibilite,
                status,
                photos || [],
                typeHebergement || 'permanent',
                dateDebut || null,
                dateFin || null,
                conditionsTemporaire || null,
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

    /**
     * Récupère les logements d'un utilisateur spécifique
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getLogementsByUserId(req, res) {
        try {
            console.log('=== DÉBUT DE LA RÉCUPÉRATION DES LOGEMENTS PAR USER ID ===');
            console.log('User object:', req.user);
            
            const userId = req.user?.id;
            
            if (!userId) {
                console.error('Erreur: Utilisateur non authentifié ou ID manquant');
                return res.status(401).json({ 
                    message: 'Utilisateur non authentifié',
                    details: 'L\'ID de l\'utilisateur est manquant dans le token'
                });
            }

            console.log('Recherche des logements pour l\'utilisateur:', userId);

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
                WHERE proprietaire_id = $1
                ORDER BY created_at DESC
            `;
            
            const result = await pool.query(query, [userId]);
            console.log('Nombre de logements trouvés:', result.rows.length);
            
            // Transformer les résultats pour correspondre au format attendu par le client
            const logements = result.rows.map(logement => ({
                id: logement.id,
                titre: logement.titre,
                description: logement.description || '',
                adresse: logement.adresse,
                codePostal: logement.code_postal,
                ville: logement.ville,
                type: logement.type,
                capacite: logement.capacite,
                surface: logement.surface,
                equipements: logement.equipements || {},
                disponibilite: logement.disponibilite,
                status: logement.status,
                photos: logement.photos || [],
                typeHebergement: logement.type_hebergement,
                dateDebut: logement.date_debut,
                dateFin: logement.date_fin,
                conditionsTemporaire: logement.conditions_temporaire,
                dateCreation: logement.created_at,
                dateModification: logement.updated_at,
                proprietaireId: logement.proprietaire_id
            }));
            
            console.log('Logements transformés:', logements);
            return res.status(200).json(logements);
        } catch (error) {
            console.error('=== ERREUR DÉTAILLÉE LORS DE LA RÉCUPÉRATION DES LOGEMENTS ===');
            console.error('Message d\'erreur:', error.message);
            console.error('Stack trace:', error.stack);
            return res.status(500).json({ 
                message: 'Erreur serveur lors de la récupération des logements',
                details: error.message
            });
        }
    }
}

module.exports = LogementsController; 