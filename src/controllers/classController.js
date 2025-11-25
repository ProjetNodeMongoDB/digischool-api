const classService = require('../services/classService');

class ClassController {
  // @desc    Get all classes
  // @route   GET /api/classes
  // @access  Private
  async getAll(req, res, next) {
    try {
      const classes = await classService.getAllClasses();
      res.status(200).json({
        success: true,
        count: classes.length,
        data: classes,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get single class
  // @route   GET /api/classes/:id
  // @access  Private
  async getById(req, res, next) {
    try {
      const classe = await classService.getClassById(req.params.id);
      res.status(200).json({
        success: true,
        data: classe,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Create new class
  // @route   POST /api/classes
  // @access  Private
  async create(req, res, next) {
    try {
      const classe = await classService.createClass(req.body);
      res.status(201).json({
        success: true,
        data: classe,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update class
  // @route   PUT /api/classes/:id
  // @access  Private
  async update(req, res, next) {
    try {
      const classe = await classService.updateClass(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: classe,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete class
  // @route   DELETE /api/classes/:id
  // @access  Private
  async delete(req, res, next) {
    try {
      await classService.deleteClass(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Class deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClassController();
