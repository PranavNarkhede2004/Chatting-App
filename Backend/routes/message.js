const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');
const { messageValidation, handleValidationErrors } = require('../middleware/validation');

router.post('/send', auth, messageValidation, handleValidationErrors, messageController.sendMessage);
router.get('/history', auth, messageController.getMessages);
router.get('/conversations', auth, messageController.getConversations);
router.get('/history/:userId', auth, messageController.getMessages);
router.put('/read', auth, messageController.markAsRead);
router.delete('/:messageId', auth, messageController.deleteMessage);

module.exports = router;
