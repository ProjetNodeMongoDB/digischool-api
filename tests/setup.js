const mongoose = require('mongoose');

// Setup before all tests
beforeAll(async () => {
    // Use test database
    process.env.MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/digischool-test';
});

// Cleanup after all tests
afterAll(async () => {
    await mongoose.connection.close();
});