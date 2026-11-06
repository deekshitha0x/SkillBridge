import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is missing.');
  process.exit(1);
}

import authRoutes from './routes/auth.js';
import skillsRoutes from './routes/skills.js';
import assessmentsRoutes from './routes/assessments.js';
import jobsRoutes from './routes/jobs.js';
import challengesRoutes from './routes/challenges.js';
import profileRoutes from './routes/profile.js';
import institutionRoutes from './routes/institution.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup for Vite frontend client
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow dev origins
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/institution', institutionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'SkillBridge API',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'SkillBridge REST API Service (SIH 2026)',
    health: '/api/health',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SkillBridge Server running on http://localhost:${PORT}`);
});
