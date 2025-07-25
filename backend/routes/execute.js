const express = require('express');
module.exports = function({ io, geminiService, mcpAgent, streamer }) {
  const router = express.Router();

  router.post('/execute', async (req, res) => {
    const { prompt } = req.body;
    try {
      const steps = await geminiService.generarPasos(prompt);
      const mcp = mcpAgent.lanzarMCP();
      io.emit('chat-message', { sender: 'agent', text: `Iniciando flujo: "${prompt}"` });
      res.json({ executionId: Date.now().toString(), steps });

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const desc = describeStep(step);
        io.emit('chat-message', { sender: 'agent', text: `Paso ${i + 1}: ${desc}` });
        mcpAgent.enviarAccion(mcp, step);
        await streamer.executeStep(step);
        await new Promise(r => setTimeout(r, 500));
      }
      io.emit('chat-message', { sender: 'agent', text: 'Flujo completo ✅' });
    } catch (err) {
      console.error('Execution error', err);
      io.emit('chat-message', { sender: 'agent', text: 'Ocurrió un error en la ejecución' });
      res.status(500).json({ error: 'Execution failed' });
    }
  });

  return router;
};

function describeStep(step) {
  if (
    step.action === 'navigate' ||
    step.type === 'navigate' ||
    step.action === 'goto' ||
    step.type === 'goto'
  ) {
    return `Navegar a ${step.url || step.action.url}`;
  } else if (step.action === 'click' || step.type === 'click') {
    return `Hacer clic en ${step.selector || step.action.selector}`;
  } else if (step.action === 'fill' || step.type === 'fill') {
    return `Rellenar ${step.selector || step.action.selector} con "${step.value || step.action.value}"`;
  } else if (step.action === 'screenshot' || step.type === 'screenshot') {
    return 'Tomar captura de pantalla';
  }
  return JSON.stringify(step);
}
