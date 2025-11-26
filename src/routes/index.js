const express = require('express');
const router = express.Router();

// Import route modules
const teacherRoutes = require('./teacherRoutes');
const studentRoutes = require('./studentRoutes');
const classRoutes = require('./classRoutes');
const subjectRoutes = require('./subjectRoutes');
const trimesterRoutes = require('./trimesterRoutes');
const gradeRoutes = require('./gradeRoutes');

// Use route modules
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/trimesters', trimesterRoutes);
router.use('/grades', gradeRoutes);

module.exports = router;
