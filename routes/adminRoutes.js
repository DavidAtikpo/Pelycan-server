const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Protéger toutes les routes admin avec authentification et vérification du rôle admin
router.use(authMiddleware, checkRole(['admin']));

// Routes statistiques
router.get('/statistics', adminController.getStatistics);
router.get('/dashboard/stats', adminController.getDashboardStats);

// Routes de gestion des professionnels
router.get('/professionals', adminController.getAllProfessionals);
router.patch('/professionals/:proId/status', adminController.updateProfessionalStatus);
router.delete('/professionals/:proId', adminController.deleteProfessional);

// Routes de gestion des cas
router.get('/unassigned-cases', adminController.getUnassignedCases);
router.post('/assignments', adminController.assignCase);
router.get('/professionals/available', adminController.getAvailableProfessionals);

// Routes pour la gestion des utilisateurs
router.get('/users', adminController.getAllUsers);
router.patch('/users/:userId/status', adminController.updateUserStatus);

// Routes de gestion des urgences
router.get('/emergency/:id', adminController.getEmergencyDetails);
router.get('/emergencies', adminController.getPendingEmergencies);
router.post('/emergency/:id/assign', adminController.assignEmergency);

module.exports = router; 