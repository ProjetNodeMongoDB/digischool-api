const studentService = require('../services/studentService');

class StudentController {
  // @desc    Get all students with optional filtering and grouping
  // @route   GET /api/students
  // @route   GET /api/students?classe=:classId
  // @route   GET /api/students?groupBy=class
  // @access  Private
  async getAll(req, res, next) {
    try {
      // Check for grouped request
      if (req.query.groupBy === 'class') {
        const groupedStudents = await studentService.getStudentsGroupedByClass();

        // Calculate total students across all classes
        const totalStudents = groupedStudents.reduce((sum, classGroup) => sum + classGroup.students.length, 0);

        return res.status(200).json({
          success: true,
          count: groupedStudents.length, // Number of classes
          totalStudents: totalStudents, // Total number of students
          data: groupedStudents,
        });
      }

      // Check for class filter query param
      if (req.query.classe) {
        const students = await studentService.getStudentsByClass(req.query.classe);
        return res.status(200).json({
          success: true,
          count: students.length,
          data: students,
        });
      }

      // Default: return all students
      const students = await studentService.getAllStudents();
      res.status(200).json({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get single student
  // @route   GET /api/students/:id
  // @access  Private
  async getById(req, res, next) {
    try {
      const student = await studentService.getStudentById(req.params.id);
      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Create new student
  // @route   POST /api/students
  // @access  Private
  async create(req, res, next) {
    try {
      const student = await studentService.createStudent(req.body);
      res.status(201).json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update student
  // @route   PUT /api/students/:id
  // @access  Private
  async update(req, res, next) {
    try {
      const student = await studentService.updateStudent(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete student
  // @route   DELETE /api/students/:id
  // @access  Private
  async delete(req, res, next) {
    try {
      await studentService.deleteStudent(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Student deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
