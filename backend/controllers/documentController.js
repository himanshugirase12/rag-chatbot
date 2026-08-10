const Document = require('../models/Document');

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const document = await Document.create({
      owner: req.userId,
      originalName: req.file.originalname,
      filePath: req.file.path,
      status: 'processing'
    });

    res.status(201).json({ document });

    // Ingestion pipeline (parse -> chunk -> embed -> store) will be
    // triggered here in Phase 2 — for now the file just gets saved
    // and marked "processing"
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ owner: req.userId }).sort({ createdAt: -1 });
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { uploadDocument, getMyDocuments };    