const express = require('express');
const router = express.Router();

// Import route modules
const teacherRoutes = require('./teacherRoutes');
const studentRoutes = require('./studentRoutes');

// Use route modules
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);

module.exports = router;