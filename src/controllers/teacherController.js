const teacherService = require('../services/teacherService');

class TeacherController {
  // @desc    Get all teachers or filter by class
  // @route   GET /api/teachers
  // @route   GET /api/teachers?classe=:classId
  // @access  Private
  async getAll(req, res, next) {
    try {
      let teachers;

      // Check if classe query parameter is provided
      if (req.query.classe) {
        teachers = await teacherService.getTeachersByClass(req.query.classe);
      } else {
        teachers = await teacherService.getAllTeachers();
      }

      res.status(200).json({
        success: true,
        count: teachers.length,
        data: teachers,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get single teacher
  // @route   GET /api/teachers/:id
  // @access  Private
  async getById(req, res, next) {
    try {
      const teacher = await teacherService.getTeacherById(req.params.id);
      res.status(200).json({
        success: true,
        data: teacher,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Create new teacher
  // @route   POST /api/teachers
  // @access  Private
  async create(req, res, next) {
    try {
      const teacher = await teacherService.createTeacher(req.body);
      res.status(201).json({
        success: true,
        data: teacher,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update teacher
  // @route   PUT /api/teachers/:id
  // @access  Private
  async update(req, res, next) {
    try {
      const teacher = await teacherService.updateTeacher(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: teacher,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete teacher
  // @route   DELETE /api/teachers/:id
  // @access  Private
  async delete(req, res, next) {
    try {
      await teacherService.deleteTeacher(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Teacher deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TeacherController();
