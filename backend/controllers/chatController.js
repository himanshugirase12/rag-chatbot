const generateEmbedding = require('../utils/generateEmbedding');
const searchChunks = require('../utils/searchChunks');
const generateAnswer = require('../utils/generateAnswer');
const checkAndIncrement = require('../utils/checkUsageLimit');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const askQuestion = async (req, res) => {
  try {
    const { question, conversationId } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const usage = await checkAndIncrement(req.userId, 'question');
    if (!usage.allowed) {
      return res.status(403).json({ message: usage.message, upgradeRequired: true });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, owner: req.userId });
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
    } else {
      conversation = await Conversation.create({
        owner: req.userId,
        title: question.substring(0, 50)
      });
    }

    await Message.create({
      conversation: conversation._id,
      role: 'user',
      content: question
    });

    const queryEmbedding = await generateEmbedding(question, 'RETRIEVAL_QUERY');
    const chunks = await searchChunks(queryEmbedding, req.userId);

    let answer;
    let sources = [];

    if (chunks.length === 0) {
      answer = "I don't have any documents to search yet. Please upload one first.";
    } else {
      answer = await generateAnswer(question, chunks);
      sources = chunks.map((c) => ({ documentId: c.document, text: c.text, score: c.score }));
    }

    await Message.create({
      conversation: conversation._id,
      role: 'assistant',
      content: answer,
      sources
    });

    res.json({
      conversationId: conversation._id,
      answer,
      sources,
      remaining: usage.remaining
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ owner: req.userId }).sort({ updatedAt: -1 });
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, owner: req.userId });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: req.params.id }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { askQuestion, getConversations, getMessages };