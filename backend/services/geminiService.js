class GeminiService {
  constructor({ apiKey, modelName = 'gemini-pro' }) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async generarPasos(prompt) {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(`Convierte este prompt en pasos para Playwright MCP en JSON:\n"${prompt}"`);
    const text = (await result.response).text();
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error('Parse error', err);
      return [
        { action: 'navigate', url: 'https://example.com' },
        { action: 'click', selector: 'text=Example Domain' }
      ];
    }
  }
}

module.exports = GeminiService;
