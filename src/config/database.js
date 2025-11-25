const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      /**
       * family: 4 forces IPv4 resolution for MongoDB connections
       *
       * Why this is needed:
       * - Node.js 17+ changed default DNS resolution to IPv6-first (family: 0)
       * - MongoDB servers often don't support IPv6 or have IPv6 misconfigured
       * - "localhost" may resolve to ::1 (IPv6) instead of 127.0.0.1 (IPv4)
       * - This causes ECONNREFUSED errors when MongoDB only listens on 127.0.0.1
       *
       * Solution:
       * - family: 4 explicitly forces IPv4 resolution (127.0.0.1)
       * - Prevents connection failures on systems with IPv6 enabled
       * - Ensures consistent behavior across Windows, macOS, and Linux
       *
       * Alternative: Use 127.0.0.1 directly in MONGO_URI instead of "localhost"
       */
      family: 4,
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
