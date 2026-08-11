const mongoose = require('mongoose');
const Chunk = require('../models/Chunk');

const searchChunks = async (queryEmbedding, ownerId, limit = 5) => {
  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: limit,
        filter: { owner: new mongoose.Types.ObjectId(ownerId) }
      }
    },
    {
      $project: {
        text: 1,
        document: 1,
        score: { $meta: 'vectorSearchScore' }
      }
    }
  ]);

  return results;
};

module.exports = searchChunks;