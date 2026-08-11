const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { askQuestion } = require('../controllers/chatController');

router.post('/ask', verifyToken, askQuestion);

module.exports = router;