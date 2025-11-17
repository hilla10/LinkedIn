import mongoose from 'mongoose';

let isConnected = false; // ❗ important: global connection flag

const connectDB = async () => {
  if (isConnected) {
    // If already connected, don't create a new connection
    console.log('MongoDB already connected');
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('❌ Missing MONGODB_URI in environment variables');
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);

    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB Connected:', db.connection.host);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    throw error;
  }
};

export default connectDB;
