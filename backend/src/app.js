import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/env.js';
// import { generalLimiter } from './middleware/rateLimit.middleware.js';
import notFound from './middleware/notFound.middleware.js';
import errorMiddleware from './middleware/error.middleware.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import equipmentRoutes from './routes/equipment.routes.js';
import borrowRoutes from './routes/borrow.routes.js';
import returnRoutes from './routes/return.routes.js';
import inspectionRoutes from './routes/inspection.routes.js';
import sanitizationRoutes from './routes/sanitization.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import adminRoutes from './routes/admin.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers & cookie parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Global rate limiting
// app.use('/api', generalLimiter);

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    success: connected,
    message: 'CareShare API is running',
    database: connected ? 'connected' : 'disconnected',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/borrow-requests', borrowRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/sanitization', sanitizationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use(notFound);

// Centralized Error Handler
app.use(errorMiddleware);

export default app;
