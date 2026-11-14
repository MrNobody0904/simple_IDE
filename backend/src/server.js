import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import runRouter from './routes/run.js';
import submitRouter from './routes/submit.js';
import problemsRouter from './routes/problems.js';
import { runLimiter, submitLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory or project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with size limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    name: 'OA IDE Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount routes
app.use('/api', runLimiter, runRouter);
app.use('/api/submit', submitLimiter, submitRouter);
app.use('/api/problems', problemsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    status: 'error',
    stdout: '',
    stderr: 'Internal Server Error',
    time: '0.00',
    memory: 0,
    exitCode: 1
  });
});

const server = app.listen(PORT, () => {
  console.log(`OA IDE Backend running on http://localhost:${PORT}`);
  console.log(`Using Judge0 Endpoint: ${process.env.JUDGE0_API_URL || 'https://ce.judge0.com'}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[OA IDE Error] Port ${PORT} is already in use.`);
    console.error(`Another process is running on port ${PORT}. Please stop it or change PORT in .env.\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
