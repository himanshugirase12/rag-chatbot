const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { uploadDocument, getMyDocuments } = require('../controllers/documentController');

router.post('/upload', verifyToken, upload.single('file'), uploadDocument);
router.get('/', verifyToken, getMyDocuments);

module.exports = router;