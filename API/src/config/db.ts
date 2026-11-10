import mongoose from 'mongoose';
import process from 'process';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('error');
  }

  await mongoose.connect(uri);
  console.log('Conectado a MongoDB');
};