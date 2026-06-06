const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('Retrying connection in 5 seconds...');

    // Retry once after 5 seconds
    setTimeout(async () => {
      try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected on retry: ${conn.connection.host}`);
      } catch (retryError) {
        console.error(`MongoDB retry failed: ${retryError.message}`);
        process.exit(1);
      }
    }, 5000);
  }
};

module.exports = connectDB;
