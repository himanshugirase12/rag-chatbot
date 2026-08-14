const Document = require('../models/Document');
const Chunk = require('../models/Chunk');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const mongoose = require('mongoose');

const getStats = async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.userId);

    const totalDocuments = await Document.countDocuments({ owner: ownerId });
    const totalChunks = await Chunk.countDocuments({ owner: ownerId });

    const conversations = await Conversation.find({ owner: ownerId }).select('_id');
    const conversationIds = conversations.map((c) => c._id);

    const topSources = await Message.aggregate([
      { $match: { conversation: { $in: conversationIds }, role: 'assistant' } },
      { $unwind: '$sources' },
      { $group: { _id: '$sources.documentId', citationCount: { $sum: 1 } } },
      { $sort: { citationCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'documents',
          localField: '_id',
          foreignField: '_id',
          as: 'document'
        }
      },
      { $unwind: '$document' },
      {
        $project: {
          documentId: '$_id',
          originalName: '$document.originalName',
          citationCount: 1
        }
      }
    ]);

    const totalCitations = topSources.reduce((sum, s) => sum + s.citationCount, 0);
    const topSourcesWithPercent = topSources.map((s) => ({
      documentId: s.documentId,
      name: s.originalName,
      citationCount: s.citationCount,
      percent: totalCitations > 0 ? Math.round((s.citationCount / totalCitations) * 100) : 0
    }));

    res.json({
      totalDocuments,
      totalChunks,
      topSources: topSourcesWithPercent
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getStats };