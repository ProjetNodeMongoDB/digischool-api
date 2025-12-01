/**
 * Unit Tests for TrimesterController
 * Tests HTTP request/response handling with mocked service layer
 */

const trimesterController = require('../../../src/controllers/trimesterController');
const trimesterService = require('../../../src/services/trimesterService');
const { createMockExpressContext } = require('../helpers/testUtils');
const { trimesters, mockIds, edgeCases } = require('../mocks/fixtures');

// Mock the service layer
jest.mock('../../../src/services/trimesterService');

describe('TrimesterController', () => {
  let req, res, next;

  beforeEach(() => {
    // Create fresh mocks for each test
    ({ req, res, next } = createMockExpressContext());
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return 200 with all trimesters', async () => {
      // Arrange
      const mockTrimesters = [trimesters.valid];
      trimesterService.getAllTrimesters.mockResolvedValue(mockTrimesters);

      // Act
      await trimesterController.getAll(req, res, next);

      // Assert
      expect(trimesterService.getAllTrimesters).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockTrimesters.length,
        data: mockTrimesters
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 200 with empty array when no trimesters', async () => {
      // Arrange
      trimesterService.getAllTrimesters.mockResolvedValue([]);

      // Act
      await trimesterController.getAll(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });

    it('should call next with error on service failure', async () => {
      // Arrange
      const error = new Error('Database error');
      trimesterService.getAllTrimesters.mockRejectedValue(error);

      // Act
      await trimesterController.getAll(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return 200 with trimester data', async () => {
      // Arrange
      req.params.id = mockIds.trimester1;
      trimesterService.getTrimesterById.mockResolvedValue(trimesters.valid);

      // Act
      await trimesterController.getById(req, res, next);

      // Assert
      expect(trimesterService.getTrimesterById).toHaveBeenCalledWith(mockIds.trimester1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: trimesters.valid
      });
    });

    it('should call next with error when trimester not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      const error = new Error('Trimester not found');
      trimesterService.getTrimesterById.mockRejectedValue(error);

      // Act
      await trimesterController.getById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle missing id parameter', async () => {
      // Arrange
      req.params.id = undefined;
      const error = new Error('Cast to ObjectId failed');
      trimesterService.getTrimesterById.mockRejectedValue(error);

      // Act
      await trimesterController.getById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    it('should return 201 with created trimester', async () => {
      // Arrange
      req.body = { nom: 'TRIM02', date: new Date('2024-04-01') };
      const createdTrimester = { ...req.body, _id: mockIds.trimester2 };
      trimesterService.createTrimester.mockResolvedValue(createdTrimester);

      // Act
      await trimesterController.create(req, res, next);

      // Assert
      expect(trimesterService.createTrimester).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdTrimester
      });
    });

    it('should call next with validation error', async () => {
      // Arrange
      req.body = { nom: '' };  // Invalid input
      const error = new Error('Validation failed');
      trimesterService.createTrimester.mockRejectedValue(error);

      // Act
      await trimesterController.create(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle empty request body', async () => {
      // Arrange
      req.body = {};
      const error = new Error('Missing required fields');
      trimesterService.createTrimester.mockRejectedValue(error);

      // Act
      await trimesterController.create(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('should return 200 with updated trimester', async () => {
      // Arrange
      req.params.id = mockIds.trimester1;
      req.body = { nom: 'TRIM03' };
      const updated = { ...trimesters.valid, nom: 'TRIM03' };
      trimesterService.updateTrimester.mockResolvedValue(updated);

      // Act
      await trimesterController.update(req, res, next);

      // Assert
      expect(trimesterService.updateTrimester).toHaveBeenCalledWith(mockIds.trimester1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updated
      });
    });

    it('should call next when trimester not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      req.body = { nom: 'Test' };
      const error = new Error('Trimester not found');
      trimesterService.updateTrimester.mockRejectedValue(error);

      // Act
      await trimesterController.update(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('should return 200 with success message', async () => {
      // Arrange
      req.params.id = mockIds.trimester1;
      trimesterService.deleteTrimester.mockResolvedValue(trimesters.valid);

      // Act
      await trimesterController.delete(req, res, next);

      // Assert
      expect(trimesterService.deleteTrimester).toHaveBeenCalledWith(mockIds.trimester1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Trimester deleted successfully'
      });
    });

    it('should call next when trimester not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      const error = new Error('Trimester not found');
      trimesterService.deleteTrimester.mockRejectedValue(error);

      // Act
      await trimesterController.delete(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
