const express = require('express');
const router = express.Router();
const MessagesController = require('../controllers/messagesController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

/**
 * Routes pour la gestion des messages
 */

// Route publique pour envoyer un message (accessible à tous les utilisateurs)
router.post('/', authMiddleware, checkRole(['admin', 'pro', 'user']), MessagesController.addMessage);

// Routes protégées nécessitant une authentification et un rôle spécifique
// Seuls les administrateurs et les professionnels peuvent voir et gérer les messages

// Récupérer tous les messages
router.get('/', authMiddleware, checkRole(['admin', 'pro']), MessagesController.getAllMessages);

// Récupérer les messages pour une structure spécifique
router.get('/structure/:structureId', authMiddleware, checkRole(['admin', 'pro']), MessagesController.getMessagesByStructure);

// Récupérer un message par son ID
router.get('/:id', authMiddleware, checkRole(['admin', 'pro']), MessagesController.getMessageById);

// Marquer un message comme lu ou non lu
router.patch('/:id/lu', authMiddleware, checkRole(['admin', 'pro']), MessagesController.updateMessageLu);

// Supprimer un message
router.delete('/:id', authMiddleware, checkRole(['admin']), MessagesController.deleteMessage);

module.exports = router; 