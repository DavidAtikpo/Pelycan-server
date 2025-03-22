const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
// const { adminMiddleware } = require('../middleware/adminMiddleware');

// Route pour créer une alerte (accessible aux utilisateurs authentifiés)
router.post('/create', authMiddleware, alertsController.createAlert);

// Routes admin (nécessitent le rôle admin)
router.get('/', authMiddleware, checkRole(['admin']), alertsController.getAlerts);
router.get('/active', authMiddleware, checkRole(['admin']), alertsController.getActiveAlerts);
router.post('/:alertId/message', authMiddleware, checkRole(['admin']), alertsController.sendMessage);
router.put('/:alertId/process', authMiddleware, checkRole(['admin']), alertsController.processAlert);

module.exports = router; 