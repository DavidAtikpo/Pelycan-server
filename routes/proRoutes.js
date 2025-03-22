const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const proController = require('../controllers/proController');

// Protéger toutes les routes pro avec authentification et vérification du rôle pro
router.use(authMiddleware, checkRole(['pro']));

// Routes du tableau de bord
router.get('/dashboard/stats', proController.getDashboardStats);
router.get('/cases/recent', proController.getRecentCases);
router.get('/cases/active', proController.getActiveCases);
router.get('/cases/completed', proController.getCompletedCases);

// Routes de gestion des cas
router.get('/cases/:id', proController.getCaseDetails);
router.patch('/cases/:id/status', proController.updateCaseStatus);
router.post('/cases/:id/notes', proController.addCaseNote);

// Routes de profil
router.get('/profile', proController.getProfile);
router.put('/profile', proController.updateProfile);

module.exports = router; 