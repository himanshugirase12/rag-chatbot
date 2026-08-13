const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rag-chatbot-documents',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'docx', 'txt']
  }
});

const upload = multer({ storage });

module.exports = upload;