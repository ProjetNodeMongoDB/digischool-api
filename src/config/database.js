const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // Force IPv4
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Don't exit in test environment, throw instead
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
