const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { uploadDocument, getMyDocuments, deleteDocument } = require('../controllers/documentController');

router.post('/upload', verifyToken, upload.single('file'), uploadDocument);
router.get('/', verifyToken, getMyDocuments);
router.delete('/:id', verifyToken, deleteDocument);


module.exports = router;