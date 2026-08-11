const generateEmbedding = require('../utils/generateEmbedding');
const searchChunks = require('../utils/searchChunks');
const generateAnswer = require('../utils/generateAnswer');

const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const queryEmbedding = await generateEmbedding(question);
    const chunks = await searchChunks(queryEmbedding, req.userId);

    if (chunks.length === 0) {
      return res.json({
        answer: "I don't have any documents to search yet. Please upload one first.",
        sources: []
      });
    }

    const answer = await generateAnswer(question, chunks);

    res.json({
      answer,
      sources: chunks.map((c) => ({ documentId: c.document, text: c.text, score: c.score }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { askQuestion };