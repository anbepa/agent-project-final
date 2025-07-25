class GeminiService {
  constructor({ apiKey, modelName = 'gemini-pro' }) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async generarPasos(prompt) {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(
      `Convierte este prompt en pasos para Playwright MCP en JSON:\n"${prompt}"`
    );
    let text = (await result.response).text();

    // Extraer JSON incluso si viene envuelto en un bloque de codigo
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match) {
      text = match[1];
    }

    try {
      return JSON.parse(text.trim());
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
