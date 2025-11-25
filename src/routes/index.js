const express = require('express');
const router = express.Router();

// Import route modules
const teacherRoutes = require('./teacherRoutes');
const subjectRoutes = require('./subjectRoutes');

// Use route modules
router.use('/teachers', teacherRoutes);
router.use('/subjects', subjectRoutes);

module.exports = router;