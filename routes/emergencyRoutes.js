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

// Mettre à jour le statut d'une demande d'urgence (réservé aux professionnels)
router.patch('/status/:emergencyId', emergencyController.updateEmergencyStatus);

module.exports = router; 