import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

if (!config.mongoUri) {
  console.error('FATAL: MONGO_URI is not defined. Please set it in .env');
  process.exit(1);
}

if (!config.jwtSecret) {
  console.error('FATAL: JWT_SECRET is not defined. Please set it in .env');
  process.exit(1);
}
