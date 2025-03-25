const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const authenticate = require('../middleware/authenticate');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

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