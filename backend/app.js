require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const { lanzarMCP, enviarAccion } = require('./mcpAgent');
const { generarPasos } = require('./geminiService');
const { chromium } = require('playwright');

const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;
let pageForStreaming;

async function startStreamer() {
  const context = await chromium.launchPersistentContext('./profile', { headless: false });
  const pages = context.pages();
  pageForStreaming = pages.length > 0 ? pages[0] : await context.newPage();
  setInterval(async () => {
    if (!pageForStreaming) return;
    const buffer = await pageForStreaming.screenshot();
    io.emit('screenshot', 'data:image/png;base64,' + buffer.toString('base64'));
  }, 500);
}

io.on('connection', socket => {
  console.log('Cliente conectado al stream');
});

app.post('/api/execute', async (req, res) => {
  const { prompt } = req.body;
  const pasos = await generarPasos(prompt);
  const mcp = lanzarMCP();
  io.emit('chat-message', { sender: 'agent', text: `Iniciando flujo: "${prompt}"` });
  res.json({ executionId: 'exec1', steps: pasos });
  for (let i = 0; i < pasos.length; i++) {
    const paso = pasos[i];
    let desc = '';
    if (paso.action === 'navigate' || paso.type === 'navigate') {
      desc = `Navegar a ${paso.url || paso.action.url}`;
    } else if (paso.action === 'click' || paso.type === 'click') {
      desc = `Hacer clic en ${paso.selector || paso.action.selector}`;
    } else if (paso.action === 'fill' || paso.type === 'fill') {
      desc = `Rellenar ${paso.selector || paso.action.selector} con "${paso.value || paso.action.value}"`;
    } else if (paso.action === 'screenshot' || paso.type === 'screenshot') {
      desc = 'Tomar captura de pantalla';
    } else {
      desc = JSON.stringify(paso);
    }
    io.emit('chat-message', { sender: 'agent', text: `Paso ${i+1}: ${desc}` });
    enviarAccion(mcp, paso);
    if (pageForStreaming) {
      if (paso.action === 'navigate' || paso.type === 'navigate') {
        await pageForStreaming.goto(paso.url || paso.action.url);
      } else if (paso.action === 'click' || paso.type === 'click') {
        await pageForStreaming.click(paso.selector || paso.action.selector);
      } else if (paso.action === 'fill' || paso.type === 'fill') {
        await pageForStreaming.fill(paso.selector || paso.action.selector, paso.value || paso.action.value);
      } else if (paso.action === 'screenshot' || paso.type === 'screenshot') {
        const buf = await pageForStreaming.screenshot({ fullPage: true });
        io.emit('chat-message', { sender: 'agent', screenshot: 'data:image/png;base64,' + buf.toString('base64') });
      }
    }
    await new Promise(r => setTimeout(r, 500));
  }
  io.emit('chat-message', { sender: 'agent', text: 'Flujo completo ✅' });
});

server.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
  startStreamer();
});
