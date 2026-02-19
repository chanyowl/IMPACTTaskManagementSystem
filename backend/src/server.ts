import express from 'express';
// Server entry point - triggers restart (v3)
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';
import taskRoutes from './routes/tasks.js';
import profileRoutes from './routes/profile.js';
// Task Management System routes
import taskManagementRoutes from './routes/taskManagement.js';
import objectivesRoutes from './routes/objectives.js';
import auditRoutes from './routes/audit.js';
// Knowledge & SOP Module routes
import sopsRoutes from './routes/sops.js';
// AI Integration routes (Phase 3)
import aiRoutes from './routes/aiRoutes.js';
import reportsRoutes from './routes/reports.js';
import './config/firebase.js'; // Initialize Firebase

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Crystell backend is running' });
});

// Crystell (original) routes
app.use('/api/chat', chatRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/profile', profileRoutes);

// Task Management System routes
app.use('/api/task-management', taskManagementRoutes);
app.use('/api/objectives', objectivesRoutes);
app.use('/api/audit', auditRoutes);

// Knowledge & SOP Module routes
app.use('/api/sops', sopsRoutes);

// AI Integration routes (Phase 3)
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Crystell backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;
