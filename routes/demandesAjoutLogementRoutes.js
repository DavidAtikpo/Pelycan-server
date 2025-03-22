const express = require('express');
const router = express.Router();
const demandesAjoutLogementController = require('../controllers/demandesAjoutLogementController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Routes pour les demandes d'ajout de logement
// GET /api/demandes-ajout-logement - Récupérer toutes les demandes (admin uniquement)
router.get('/', authMiddleware, adminMiddleware, demandesAjoutLogementController.getAllDemandes);

// GET /api/demandes-ajout-logement/:id - Récupérer une demande spécifique
router.get('/:id', authMiddleware, demandesAjoutLogementController.getDemandeById);

// POST /api/demandes-ajout-logement - Créer une nouvelle demande
// Note: On peut permettre à des utilisateurs non authentifiés de faire une demande
// mais si un utilisateur est authentifié, son ID sera associé à la demande
router.post('/', demandesAjoutLogementController.createDemande);

// PUT /api/demandes-ajout-logement/:id/status - Mettre à jour le statut d'une demande (admin uniquement)
router.put('/:id/status', authMiddleware, adminMiddleware, demandesAjoutLogementController.updateDemandeStatus);

// DELETE /api/demandes-ajout-logement/:id - Supprimer une demande
router.delete('/:id', authMiddleware, demandesAjoutLogementController.deleteDemande);

module.exports = router; 