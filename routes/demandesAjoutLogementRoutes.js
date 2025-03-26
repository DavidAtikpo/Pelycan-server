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
// Utiliser le middleware d'authentification pour récupérer l'ID de l'utilisateur
router.post('/', authMiddleware, demandesAjoutLogementController.createDemande);

// PUT /api/demandes-ajout-logement/:id/status - Mettre à jour le statut d'une demande (admin uniquement)
router.put('/:id/status', authMiddleware, adminMiddleware, demandesAjoutLogementController.updateDemandeStatus);

// DELETE /api/demandes-ajout-logement/:id - Supprimer une demande
router.delete('/:id', authMiddleware, demandesAjoutLogementController.deleteDemande);

// POST /api/demandes-ajout-logement/:id/cancel - Annuler une demande
router.post('/:id/cancel', authMiddleware, demandesAjoutLogementController.cancelDemande);

module.exports = router; 