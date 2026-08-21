const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateAnswer = async (question, chunks) => {
  const hasContext = chunks.length > 0;
  const context = hasContext
    ? chunks.map((c, i) => `[Source ${i + 1}]: ${c.text}`).join('\n\n')
    : '';

    const prompt = hasContext
    ? `You are a study assistant. Answer the question using ONLY the context below. If the question asks for an opinion or recommendation, you may summarize the relevant facts from the context to help the user decide, but do not invent facts not present in the context. If the context truly does not contain any information relevant to the question, respond with exactly: "NO_ANSWER_IN_DOCS"
  
  Format your answer clearly and readably:
- Use short paragraphs or bullet points, not one dense block of text
- Use numbered steps for processes or sequences
- Use markdown code blocks for any code
- Bold key terms where it aids scanning
- For complexity notation, write plain text like O(n) or O(n^2) — do NOT use LaTeX syntax like $\mathcal{O}(n^2)$
- Keep it concise — prioritize clarity over length
  
  Context:
  ${context}
  
  Question: ${question}
  
  Answer:`
    : '';

  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

  if (hasContext) {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (text.trim() === 'NO_ANSWER_IN_DOCS') {
      return await generateGeneralAnswer(question, model);
    }
    return { answer: text, grounded: true };
  }

  return await generateGeneralAnswer(question, model);
};

const generateGeneralAnswer = async (question, model) => {
  const formattingInstruction = `Answer this question clearly and in a structured way — use short paragraphs, bullet points, or numbered steps where helpful, and bold key terms. Keep it concise.\n\nQuestion: ${question}`;
  const result = await model.generateContent(formattingInstruction);
  const text = result.response.text();
  return {
    answer: `⚠️ I couldn't find this in your documents, but here's what I know generally:\n\n${text}`,
    grounded: false,
  };
};

module.exports = generateAnswer;