import './config/env.js';
import connectDB from './config/db.js';
import app from './app.js';
import { config } from './config/env.js';

const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`CareShare server running on port ${config.port} [${config.nodeEnv}]`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err.message);
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err.message);
    process.exit(1);
  });
};

startServer();
