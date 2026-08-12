const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { askQuestion, getConversations, getMessages } = require('../controllers/chatController');

router.post('/ask', verifyToken, askQuestion);
router.get('/conversations', verifyToken, getConversations);
router.get('/conversations/:id/messages', verifyToken, getMessages);

module.exports = router;