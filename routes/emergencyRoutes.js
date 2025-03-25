const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Routes protégées nécessitant une authentification
router.use(authMiddleware);

// Créer une nouvelle demande d'urgence
router.post('/request', emergencyController.createEmergencyRequest);

// Obtenir le statut d'une demande d'urgence
router.get('/status/:emergencyId', emergencyController.getEmergencyStatus);

// Mettre à jour le statut d'une demande d'urgence
router.put('/status/:emergencyId', emergencyController.updateEmergencyStatus);

// Récupérer l'historique des demandes d'urgence d'un utilisateur
router.get('/history/:userId', emergencyController.getEmergencyHistory);

module.exports = router; 