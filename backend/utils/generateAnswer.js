const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateAnswer = async (question, chunks) => {
  const context = chunks.map((c, i) => `[Source ${i + 1}]: ${c.text}`).join('\n\n');

  const prompt = `You are a study assistant. Answer the question using ONLY the context below. If the question asks for an opinion or recommendation, you may summarize the relevant facts from the context to help the user decide, but do not invent facts not present in the context. If the context truly does not contain any information relevant to the question, say "I don't have enough information in your documents to answer that" instead of guessing.

  Context:
  ${context}
  
  Question: ${question}
  
  Answer:`;

const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
  const result = await model.generateContent(prompt);

  return result.response.text();
};

module.exports = generateAnswer;