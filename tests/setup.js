// Load environment variables for tests
require('dotenv').config();

const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';

// Setup before all tests
beforeAll(async () => {
    // Use test database
    const MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/digischool-test';

    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGO_URI);
    }
}, 30000); // 30 second timeout

// Cleanup after all tests
afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
});