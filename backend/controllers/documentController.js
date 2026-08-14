const Document = require('../models/Document');
const ingestDocument = require('../utils/ingestDocument');
const checkAndIncrement = require('../utils/checkUsageLimit');
const cloudinary = require('../config/cloudinary');
const Chunk = require('../models/Chunk');

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const usage = await checkAndIncrement(req.userId, 'upload');
    if (!usage.allowed) {
      return res.status(403).json({ message: usage.message, upgradeRequired: true });
    }

    const document = await Document.create({
      owner: req.userId,
      originalName: req.file.originalname,
      filePath: req.file.path,
      status: 'processing'
    });

    res.status(201).json({ document, remaining: usage.remaining });

    ingestDocument(document._id, req.file.path, req.userId, req.file.originalname);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyDocuments = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = { owner: req.userId };
    if (search) {
      filter.originalName = { $regex: search, $options: 'i' };
    }

    const documents = await Document.find(filter).sort({ createdAt: -1 });
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, owner: req.userId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await Chunk.deleteMany({ document: document._id });
    await Document.findByIdAndDelete(document._id);

    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { uploadDocument, getMyDocuments,deleteDocument};