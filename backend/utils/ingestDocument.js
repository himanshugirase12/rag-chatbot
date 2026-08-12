const parseDocument = require('./parseDocument');
const chunkText = require('./chunkText');
const generateEmbedding = require('./generateEmbedding');
const Chunk = require('../models/Chunk');
const Document = require('../models/Document');

const ingestDocument = async (documentId, filePath, ownerId) => {
  try {
    const text = await parseDocument(filePath);

    if (!text || text.trim().length < 50) {
      await Document.findByIdAndUpdate(documentId, { status: 'failed' });
      console.log(`Document ${documentId} has no extractable text (likely scanned/image PDF)`);
      return;
    }

    const chunks = chunkText(text);

    for (const chunkContent of chunks) {
      const embedding = await generateEmbedding(chunkContent);

      await Chunk.create({
        document: documentId,
        owner: ownerId,
        text: chunkContent,
        embedding: embedding
      });
    }

    await Document.findByIdAndUpdate(documentId, {
      status: 'ready',
      chunkCount: chunks.length
    });

    console.log(`Ingested ${chunks.length} chunks for document ${documentId}`);
  } catch (err) {
    console.error('Ingestion failed:', err);
    await Document.findByIdAndUpdate(documentId, { status: 'failed' });
  }
};

module.exports = ingestDocument;