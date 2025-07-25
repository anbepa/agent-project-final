const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function generarPasos(prompt) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(`Convierte este prompt en pasos para Playwright MCP en JSON:\n"${prompt}"`);
  const text = (await result.response).text();
  try { return JSON.parse(text); }
  catch {
    return [
      { action: 'navigate', url: 'https://example.com' },
      { action: 'click', selector: 'text=Example Domain' }
    ];
  }
}
module.exports = { generarPasos };
