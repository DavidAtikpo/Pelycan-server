const express = require('express');
const router = express.Router();
const DemandesController = require('../controllers/demandesController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

/**
 * Routes pour la gestion des demandes de logement et d'hébergement
 */

// Route publique pour ajouter une nouvelle demande (accessible à tous les utilisateurs)
router.post('/', authMiddleware, checkRole(['admin', 'pro', 'user']), DemandesController.addDemande);

// Routes protégées nécessitant une authentification et un rôle spécifique
// Seuls les administrateurs et les professionnels peuvent voir et gérer les demandes

// Récupérer toutes les demandes
router.get('/', authMiddleware, checkRole(['admin', 'pro']), DemandesController.getAllDemandes);

// Récupérer les demandes par type (logement ou hébergement)
router.get('/type/:type', authMiddleware, checkRole(['admin', 'pro']), DemandesController.getDemandesByType);

// Récupérer une demande par son ID
router.get('/:id', authMiddleware, checkRole(['admin', 'pro']), DemandesController.getDemandeById);

// Mettre à jour le statut d'une demande
router.patch('/:id/status', authMiddleware, checkRole(['admin', 'pro']), DemandesController.updateDemandeStatus);

// Supprimer une demande
router.delete('/:id', authMiddleware, checkRole(['admin']), DemandesController.deleteDemande);

module.exports = router; 