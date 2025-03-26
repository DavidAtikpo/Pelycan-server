const { pool } = require('../config/dbConfig');

/**
 * Contrôleur pour la gestion des messages envoyés aux structures
 */
class MessagesController {
    /**
     * Récupère tous les messages
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAllMessages(req, res) {
        try {
            const query = `
                SELECT 
                    id, 
                    structure_id, 
                    message, 
                    date, 
                    lu, 
                    date_creation
                FROM messages 
                ORDER BY date_creation DESC
            `;
            
            const result = await pool.query(query);
            
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erreur lors de la récupération des messages:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération des messages' });
        }
    }

    /**
     * Récupère les messages pour une structure spécifique
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getMessagesByStructure(req, res) {
        try {
            const { structureId } = req.params;
            
            const query = `
                SELECT 
                    id, 
                    structure_id, 
                    message, 
                    date, 
                    lu, 
                    date_creation
                FROM messages 
                WHERE structure_id = $1
                ORDER BY date_creation DESC
            `;
            
            const result = await pool.query(query, [structureId]);
            
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erreur lors de la récupération des messages de la structure:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération des messages' });
        }
    }

    /**
     * Récupère un message par son ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getMessageById(req, res) {
        try {
            const { id } = req.params;
            
            const query = `
                SELECT 
                    id, 
                    structure_id, 
                    message, 
                    date, 
                    lu, 
                    date_creation
                FROM messages 
                WHERE id = $1
            `;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Message non trouvé' });
            }
            
            return res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Erreur lors de la récupération du message:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération du message' });
        }
    }

    /**
     * Ajoute un nouveau message
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async addMessage(req, res) {
        try {
            const { structureId, message, date } = req.body;
            
            // Validation des champs obligatoires
            if (!structureId || !message) {
                return res.status(400).json({ message: 'Structure et message sont obligatoires' });
            }
            
            // Vérification que la structure existe
            const structureCheck = await pool.query(
                'SELECT id FROM structures WHERE id = $1',
                [structureId]
            );
            
            if (structureCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Structure non trouvée' });
            }
            
            const query = `
                INSERT INTO messages (
                    structure_id, 
                    message, 
                    date, 
                    lu, 
                    date_creation
                ) 
                VALUES ($1, $2, $3, false, NOW())
                RETURNING id
            `;
            
            const values = [
                structureId, 
                message, 
                date || new Date()
            ];
            
            const result = await pool.query(query, values);
            
            return res.status(201).json({ 
                message: 'Message envoyé avec succès', 
                id: result.rows[0].id 
            });
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de l\'envoi du message' });
        }
    }

    /**
     * Marque un message comme lu ou non lu
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async updateMessageLu(req, res) {
        try {
            const { id } = req.params;
            const { lu } = req.body;
            
            // Validation du paramètre lu
            if (lu === undefined) {
                return res.status(400).json({ message: 'Le paramètre lu est obligatoire' });
            }
            
            const query = `
                UPDATE messages 
                SET 
                    lu = $1,
                    date_modification = NOW()
                WHERE id = $2
                RETURNING id
            `;
            
            const result = await pool.query(query, [lu, id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Message non trouvé' });
            }
            
            return res.status(200).json({ 
                message: lu ? 'Message marqué comme lu' : 'Message marqué comme non lu',
                id: result.rows[0].id
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut de lecture du message:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du message' });
        }
    }

    /**
     * Supprime un message
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async deleteMessage(req, res) {
        try {
            const { id } = req.params;
            
            const query = `
                DELETE FROM messages 
                WHERE id = $1
                RETURNING id
            `;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Message non trouvé' });
            }
            
            return res.status(200).json({ 
                message: 'Message supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du message:', error);
            return res.status(500).json({ message: 'Erreur serveur lors de la suppression du message' });
        }
    }

    // Récupérer toutes les conversations d'un utilisateur
    static async getConversations(req, res) {
        const userId = req.user.id;
        
        try {
            console.log('Getting conversations for user:', userId);
            
            const query = `
                WITH LastMessages AS (
                    SELECT 
                        m.conversation_id,
                        m.content as last_message,
                        m.created_at as last_message_time,
                        m.sender_id,
                        m.read,
                        ROW_NUMBER() OVER (PARTITION BY m.conversation_id ORDER BY m.created_at DESC) as rn
                    FROM messages m
                )
                SELECT 
                    c.id,
                    CASE 
                        WHEN c.user1_id = $1 THEN c.user2_id
                        ELSE c.user1_id
                    END as participant_id,
                    CASE 
                        WHEN c.user1_id = $1 THEN CONCAT(u2.first_name, ' ', u2.last_name)
                        ELSE CONCAT(u1.first_name, ' ', u1.last_name)
                    END as participant_name,
                    CASE 
                        WHEN c.user1_id = $1 THEN u2.role
                        ELSE u1.role
                    END as participant_type,
                    lm.last_message,
                    lm.last_message_time,
                    COUNT(CASE WHEN m.read = false AND m.sender_id != $1 THEN 1 END) as unread_count
                FROM conversations c
                JOIN users u1 ON c.user1_id = u1.id
                JOIN users u2 ON c.user2_id = u2.id
                LEFT JOIN messages m ON m.conversation_id = c.id
                LEFT JOIN LastMessages lm ON lm.conversation_id = c.id AND lm.rn = 1
                WHERE c.user1_id = $1 OR c.user2_id = $1
                GROUP BY c.id, u1.first_name, u1.last_name, u2.first_name, u2.last_name, u1.role, u2.role, lm.last_message, lm.last_message_time
                ORDER BY lm.last_message_time DESC NULLS LAST
            `;

            const result = await pool.query(query, [userId]);
            console.log('Found conversations:', result.rows.length);
            
            return res.status(200).json({ 
                success: true, 
                conversations: result.rows || [],
                message: result.rows.length === 0 ? 'Aucune conversation trouvée' : undefined
            });
        } catch (error) {
            console.error('Error getting conversations:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erreur lors de la récupération des conversations',
                error: error.message
            });
        }
    }

    // Récupérer les messages d'une conversation
    static async getMessages(req, res) {
        const { conversationId } = req.params;
        const userId = req.user.id;

        try {
            console.log('Getting messages for conversation:', { conversationId, userId });

            // Vérifier l'accès à la conversation
            const accessQuery = `
                SELECT id FROM conversations 
                WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
            `;
            const accessResult = await pool.query(accessQuery, [conversationId, userId]);

            if (accessResult.rows.length === 0) {
                console.log('Access denied to conversation:', conversationId);
                return res.status(403).json({ 
                    success: false, 
                    message: 'Accès non autorisé à cette conversation' 
                });
            }

            // Récupérer les messages
            const query = `
                SELECT 
                    m.id,
                    m.sender_id,
                    m.receiver_id,
                    m.content,
                    m.created_at,
                    m.read,
                    CONCAT(u.first_name, ' ', u.last_name) as sender_name,
                    u.role as sender_type
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.conversation_id = $1
                ORDER BY m.created_at ASC
            `;

            const result = await pool.query(query, [conversationId]);
            console.log('Messages retrieved:', result.rows.length);

            return res.status(200).json({ 
                success: true, 
                messages: result.rows 
            });
        } catch (error) {
            console.error('Error getting messages:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erreur lors de la récupération des messages',
                error: error.message
            });
        }
    }

    // Envoyer un message
    static async sendMessage(req, res) {
        const { conversation_id, content } = req.body;
        const sender_id = req.user.id;

        try {
            console.log('Sending message:', { conversation_id, sender_id, content });

            // Vérifier l'accès à la conversation
            const accessQuery = `
                SELECT id, user1_id, user2_id 
                FROM conversations 
                WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
            `;
            const accessResult = await pool.query(accessQuery, [conversation_id, sender_id]);

            if (accessResult.rows.length === 0) {
                console.log('Access denied to conversation:', conversation_id);
                return res.status(403).json({ 
                    success: false, 
                    message: 'Accès non autorisé à cette conversation' 
                });
            }

            // Déterminer le receiver_id
            const conversation = accessResult.rows[0];
            const receiver_id = conversation.user1_id === sender_id ? conversation.user2_id : conversation.user1_id;

            // Insérer le message
            const messageQuery = `
                INSERT INTO messages (conversation_id, sender_id, receiver_id, content)
                VALUES ($1, $2, $3, $4)
                RETURNING id, created_at, content, sender_id, receiver_id
            `;
            
            const messageResult = await pool.query(messageQuery, [
                conversation_id, 
                sender_id, 
                receiver_id, 
                content
            ]);

            console.log('Message sent successfully:', messageResult.rows[0]);

            return res.status(200).json({
                success: true,
                message: {
                    id: messageResult.rows[0].id,
                    conversation_id,
                    sender_id,
                    receiver_id,
                    content: messageResult.rows[0].content,
                    created_at: messageResult.rows[0].created_at
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erreur lors de l\'envoi du message',
                error: error.message
            });
        }
    }

    // Marquer les messages comme lus
    static async markMessagesAsRead(req, res) {
        const { conversationId } = req.params;
        const userId = req.user.id;

        try {
            const accessQuery = `
                SELECT id FROM conversations 
                WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
            `;
            const accessResult = await pool.query(accessQuery, [conversationId, userId]);

            if (accessResult.rows.length === 0) {
                return res.status(403).json({ success: false, message: 'Accès non autorisé à cette conversation' });
            }

            const query = `
                UPDATE messages
                SET read = true
                WHERE conversation_id = $1 
                AND receiver_id = $2 
                AND read = false
            `;

            await pool.query(query, [conversationId, userId]);
            res.json({ success: true, message: 'Messages marqués comme lus' });
        } catch (error) {
            console.error('Error marking messages as read:', error);
            res.status(500).json({ success: false, message: 'Erreur lors du marquage des messages comme lus' });
        }
    }

    // Signaler une conversation
    static async reportConversation(req, res) {
        const { conversation_id } = req.body;
        const userId = req.user.id;

        try {
            const accessQuery = `
                SELECT id FROM conversations 
                WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
            `;
            const accessResult = await pool.query(accessQuery, [conversation_id, userId]);

            if (accessResult.rows.length === 0) {
                return res.status(403).json({ success: false, message: 'Accès non autorisé à cette conversation' });
            }

            const query = `
                INSERT INTO reported_conversations (conversation_id, reporter_id)
                VALUES ($1, $2)
            `;

            await pool.query(query, [conversation_id, userId]);
            res.json({ success: true, message: 'Conversation signalée avec succès' });
        } catch (error) {
            console.error('Error reporting conversation:', error);
            res.status(500).json({ success: false, message: 'Erreur lors du signalement de la conversation' });
        }
    }

    // Récupérer les professionnels disponibles
    static async getAvailableProfessionals(req, res) {
        try {
            const query = `
                SELECT 
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.role as type,
                    u.phone_number,
                    u.email,
                    u.permission,
                    u.specialite
                FROM users u
                WHERE u.role = 'pro'
                AND u.permission = true
                AND u.status = 'active'
                ORDER BY u.first_name ASC
            `;
            
            const result = await pool.query(query);
            
            return res.status(200).json({
                success: true,
                professionals: result.rows
            });
        } catch (error) {
            console.error('Error getting available professionals:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des professionnels'
            });
        }
    }

    // Démarrer une nouvelle conversation avec un professionnel
    static async startConversation(req, res) {
        const { professional_id } = req.body;
        const userId = req.user.id;

        try {
            console.log('Starting conversation with:', { userId, professional_id });

            // Vérifier si le professionnel existe et est disponible
            const professionalQuery = `
                SELECT id, first_name, last_name, role as type, specialite 
                FROM users 
                WHERE id = $1 
                AND role = 'pro' 
                AND permission = true 
                AND status = 'active'
            `;
            const professionalResult = await pool.query(professionalQuery, [professional_id]);

            if (professionalResult.rows.length === 0) {
                console.log('Professional not found or not available:', professional_id);
                return res.status(404).json({
                    success: false,
                    message: 'Professionnel non trouvé ou non disponible'
                });
            }

            // Vérifier si une conversation existe déjà
            const existingConversationQuery = `
                SELECT id FROM conversations 
                WHERE (user1_id = $1 AND user2_id = $2) 
                OR (user1_id = $2 AND user2_id = $1)
            `;
            const existingConversation = await pool.query(existingConversationQuery, [userId, professional_id]);

            let conversationId;
            if (existingConversation.rows.length > 0) {
                conversationId = existingConversation.rows[0].id;
                console.log('Existing conversation found:', conversationId);
            } else {
                // Créer une nouvelle conversation
                const newConversationQuery = `
                    INSERT INTO conversations (user1_id, user2_id)
                    VALUES ($1, $2)
                    RETURNING id
                `;
                const newConversation = await pool.query(newConversationQuery, [userId, professional_id]);
                conversationId = newConversation.rows[0].id;
                console.log('New conversation created:', conversationId);
            }

            // Récupérer les informations de la conversation
            const conversationQuery = `
                SELECT 
                    c.id,
                    CASE 
                        WHEN c.user1_id = $1 THEN c.user2_id
                        ELSE c.user1_id
                    END as participant_id,
                    CASE 
                        WHEN c.user1_id = $1 THEN CONCAT(u2.first_name, ' ', u2.last_name)
                        ELSE CONCAT(u1.first_name, ' ', u1.last_name)
                    END as participant_name,
                    CASE 
                        WHEN c.user1_id = $1 THEN u2.role
                        ELSE u1.role
                    END as participant_type,
                    NULL as last_message,
                    NULL as last_message_time,
                    0 as unread_count
                FROM conversations c
                JOIN users u1 ON c.user1_id = u1.id
                JOIN users u2 ON c.user2_id = u2.id
                WHERE c.id = $2
            `;
            const conversationResult = await pool.query(conversationQuery, [userId, conversationId]);

            if (conversationResult.rows.length === 0) {
                console.log('Conversation not found after creation:', conversationId);
                return res.status(404).json({
                    success: false,
                    message: 'Conversation non trouvée'
                });
            }

            console.log('Conversation details:', conversationResult.rows[0]);

            return res.status(200).json({
                success: true,
                conversation: conversationResult.rows[0]
            });
        } catch (error) {
            console.error('Error in startConversation:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de la conversation',
                error: error.message
            });
        }
    }
}

module.exports = MessagesController; 