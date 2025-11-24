const express = require('express');
const router = express.Router();

// Import route modules
const teacherRoutes = require('./teacherRoutes');
const trimesterRoutes = require('./trimesterRoutes');

// Use route modules
router.use('/teachers', teacherRoutes);
router.use('/trimesters', trimesterRoutes);

module.exports = router;