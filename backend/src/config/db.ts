import mongoose from 'mongoose';
import { config } from './config';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${(error as Error).message}`);
    console.warn(`⚠️ The server will continue running, but database operations will fail until credentials are fixed.`);
  }
};
