const trimesterService = require('../services/trimesterService');

class TrimesterController {
  // @desc    Get all trimesters
  // @route   GET /api/trimesters
  // @access  Private
  async getAll(req, res, next) {
    try {
      const trimesters = await trimesterService.getAllTrimesters();
      res.status(200).json({
        success: true,
        count: trimesters.length,
        data: trimesters,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get single trimester
  // @route   GET /api/trimesters/:id
  // @access  Private
  async getById(req, res, next) {
    try {
      const trimester = await trimesterService.getTrimesterById(req.params.id);
      res.status(200).json({
        success: true,
        data: trimester,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Create new trimester
  // @route   POST /api/trimesters
  // @access  Private
  async create(req, res, next) {
    try {
      const trimester = await trimesterService.createTrimester(req.body);
      res.status(201).json({
        success: true,
        data: trimester,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update trimester
  // @route   PUT /api/trimesters/:id
  // @access  Private
  async update(req, res, next) {
    try {
      const trimester = await trimesterService.updateTrimester(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: trimester,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete trimester
  // @route   DELETE /api/trimesters/:id
  // @access  Private
  async delete(req, res, next) {
    try {
      await trimesterService.deleteTrimester(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Trimester deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TrimesterController();
