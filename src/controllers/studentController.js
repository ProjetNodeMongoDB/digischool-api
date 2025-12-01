const studentService = require('../services/studentService');

class StudentController {
  // @desc    Get all students
  // @route   GET /api/students
  // @access  Private
  async getAll(req, res, next) {
    try {
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
