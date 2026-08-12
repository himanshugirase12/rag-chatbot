const express = require('express');
const router = express.Router();
const { register, login, upgradeToPro } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/upgrade', verifyToken, upgradeToPro);

module.exports = router;