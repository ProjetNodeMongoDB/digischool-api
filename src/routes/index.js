const express = require('express');
const router = express.Router();

// Import route modules
const teacherRoutes = require('./teacherRoutes');
const studentRoutes = require('./studentRoutes');
const classRoutes = require('./classRoutes');

// Use route modules
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/classes', classRoutes);

module.exports = router;