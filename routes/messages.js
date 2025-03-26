const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Récupérer les professionnels disponibles
router.get('/professionals/available', messagesController.getAvailableProfessionals);

// Démarrer une nouvelle conversation
router.post('/start-conversation', messagesController.startConversation);

// Récupérer toutes les conversations
router.get('/conversations', messagesController.getConversations);

// Récupérer les messages d'une conversation
router.get('/:conversationId', messagesController.getMessages);

// Envoyer un message
router.post('/send', messagesController.sendMessage);

// Marquer les messages comme lus
router.post('/:conversationId/read', messagesController.markMessagesAsRead);

// Signaler une conversation
router.post('/report', messagesController.reportConversation);

module.exports = router; 