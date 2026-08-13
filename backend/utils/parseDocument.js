const fs = require('fs');
const mammoth = require('mammoth');
const path = require('path');
const https = require('https');
const os = require('os');

const downloadToTemp = (url, ext) => {
  return new Promise((resolve, reject) => {
    const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}${ext}`);
    const file = fs.createWriteStream(tempPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(tempPath);
      });
    }).on('error', reject);
  });
};

const parseDocument = async (filePathOrUrl, originalName) => {
  const isUrl = filePathOrUrl.startsWith('http');
  const ext = path.extname(originalName).toLowerCase();
  const localPath = isUrl ? await downloadToTemp(filePathOrUrl, ext) : filePathOrUrl;

  let text;
  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(localPath);
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    await parser.destroy();
    text = result.text;
  } else if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: localPath });
    text = result.value;
  } else if (ext === '.txt') {
    text = fs.readFileSync(localPath, 'utf-8');
  } else {
    throw new Error('Unsupported file type');
  }

  if (isUrl) fs.unlinkSync(localPath);
  return text;
};

module.exports = parseDocument;