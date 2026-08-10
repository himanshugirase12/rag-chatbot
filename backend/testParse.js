require('dotenv').config();
const generateEmbedding = require('./utils/generateEmbedding');

generateEmbedding('Two Sum problem uses a HashMap for O(n) solution')
  .then((vector) => {
    console.log('Vector length:', vector.length);
    console.log('First 5 values:', vector.slice(0, 5));
  })
  .catch((err) => console.error('Error:', err));