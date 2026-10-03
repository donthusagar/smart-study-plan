import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './server/config/db';
import { seedDemoData } from './server/utils/seedData';

import authRoutes from './server/routes/authRoutes';
import subjectRoutes from './server/routes/subjectRoutes';
import topicRoutes from './server/routes/topicRoutes';
import sessionRoutes from './server/routes/sessionRoutes';
import taskRoutes from './server/routes/taskRoutes';
import examRoutes from './server/routes/examRoutes';
import progressRoutes from './server/routes/progressRoutes';
import dashboardRoutes from './server/routes/dashboardRoutes';
import pomodoroRoutes from './server/routes/pomodoroRoutes';
import aiRoutes from './server/routes/aiRoutes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/study-sessions', sessionRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smart Study Planner Full-Stack API'
  });
});

async function startServer() {
  try {
    // 1. Initialize Database & Seed data
    await connectDB();
    await seedDemoData();

    // 2. Configure Vite middleware for development or Static files for production
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
      const { createServer } = await import('vite');
      const vite = await createServer({
        server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
        appType: 'spa'
      });
      app.use(vite.middlewares);
      console.log('⚡ Vite development middleware attached.');
    } else {
      const distPath = path.resolve(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log('📦 Production static build served from:', distPath);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Smart Study Planner server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Fatal server boot failure:', error);
    process.exit(1);
  }
}

startServer();
