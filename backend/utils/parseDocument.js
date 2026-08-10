const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

const parseDocument = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  throw new Error('Unsupported file type');
};

module.exports = parseDocument;