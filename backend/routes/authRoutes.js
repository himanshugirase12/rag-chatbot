const express = require('express');
const router = express.Router();
const { register, login, upgradeToPro, getMe, updateProfile, changePassword, deleteAccount } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/upgrade', verifyToken, upgradeToPro);
router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateProfile);
router.put('/me/password', verifyToken, changePassword);
router.delete('/me', verifyToken, deleteAccount);

module.exports = router;