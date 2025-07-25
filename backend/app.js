require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const GeminiService = require('./services/geminiService');
const mcpAgent = require('./utils/mcpAgent');
const Streamer = require('./utils/streamer');
const createExecuteRoute = require('./routes/execute');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;

const geminiService = new GeminiService({ apiKey: process.env.GEMINI_API_KEY });
const streamer = new Streamer(io);

(async () => {
  try {
    await streamer.start();
  } catch (err) {
    console.error('Unable to start streamer', err);
  }
})();

app.use('/api', createExecuteRoute({ io, geminiService, mcpAgent, streamer }));

io.on('connection', () => {
  console.log('Cliente conectado al stream');
});

server.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});
