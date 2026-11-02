import mongoose from 'mongoose';
import { config } from './env.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, { dbName: 'careshare' });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection failed (${error.name || 'database error'}).`);
    process.exit(1);
  }
};

export default connectDB;
