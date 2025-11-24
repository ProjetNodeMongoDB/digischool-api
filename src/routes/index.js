const express = require('express');
const router = express.Router();

// Import route modules
const teacherRoutes = require('./teacherRoutes');

// Use route modules
router.use('/teachers', teacherRoutes);

module.exports = router;