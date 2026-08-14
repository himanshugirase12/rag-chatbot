const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { askQuestion, getConversations, getMessages,deleteConversation } = require('../controllers/chatController');

router.post('/ask', verifyToken, askQuestion);
router.get('/conversations', verifyToken, getConversations);
router.get('/conversations/:id/messages', verifyToken, getMessages);
router.delete('/conversations/:id', verifyToken, deleteConversation);

module.exports = router;