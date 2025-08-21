const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const emailMessageController = require('../controllers/emailMessageController');
const userCreationController = require('../controllers/userCreationController');
const auth = require('../middleware/auth');

// Message routes
router.post('/send', auth, messageController.sendMessage);
router.get('/messages', auth, messageController.getMessages);
router.get('/conversations', auth, messageController.getConversations);
router.post('/conversations', auth, messageController.createConversation);
router.put('/read', auth, messageController.markAsRead);
router.delete('/:messageId', auth, messageController.deleteMessage);

// Email message routes
router.post('/send-by-email', auth, emailMessageController.sendMessageByEmail);
router.get('/user/:email', auth, emailMessageController.getUserByEmail);
router.get('/search', auth, emailMessageController.searchUserByEmail); // New endpoint for frontend
router.get('/conversation/email/:email', auth, emailMessageController.getConversationByEmail);

// User creation routes for email chat
router.post('/create-user', auth, userCreationController.createUserByEmail);
router.get('/check-user', auth, userCreationController.checkUserExists);

module.exports = router;
