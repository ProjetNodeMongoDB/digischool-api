const gradeService = require('../services/gradeService');

class GradeController {
  // @desc    Get all grades with optional filtering
  // @route   GET /api/grades
  // @access  Private
  async getAll(req, res, next) {
    try {
      // Parse query parameters for filtering
      const filters = {
        student: req.query.student,    // ?student=ID
        class: req.query.class,        // ?class=ID
        subject: req.query.subject,    // ?subject=ID
        trimester: req.query.trimester // ?trimester=ID
      };

      const grades = await gradeService.getAllGrades(filters);

      res.status(200).json({
        success: true,
        count: grades.length,
        data: grades,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get single grade
  // @route   GET /api/grades/:id
  // @access  Private
  async getById(req, res, next) {
    try {
      const grade = await gradeService.getGradeById(req.params.id);
      res.status(200).json({
        success: true,
        data: grade,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Create new grade
  // @route   POST /api/grades
  // @access  Private
  async create(req, res, next) {
    try {
      const grade = await gradeService.createGrade(req.body);
      res.status(201).json({
        success: true,
        data: grade,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update grade
  // @route   PUT /api/grades/:id
  // @access  Private
  async update(req, res, next) {
    try {
      const grade = await gradeService.updateGrade(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: grade,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete grade
  // @route   DELETE /api/grades/:id
  // @access  Private
  async delete(req, res, next) {
    try {
      await gradeService.deleteGrade(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Grade deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get students with grades by teacher
  // @route   GET /api/teachers/:teacherId/students-grades
  // @access  Private
  async getStudentsByTeacher(req, res, next) {
    try {
      const data = await gradeService.getStudentsWithGradesByTeacher(req.params.teacherId);

      res.status(200).json({
        success: true,
        count: data.length,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GradeController();
