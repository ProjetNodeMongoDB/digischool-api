/**
 * Unit Tests for ClassController
 * Tests HTTP request/response handling with mocked service layer
 */

const classController = require('../../../src/controllers/classController');
const classService = require('../../../src/services/classService');
const { createMockExpressContext } = require('../helpers/testUtils');
const { classes, mockIds, edgeCases } = require('../mocks/fixtures');

// Mock the service layer
jest.mock('../../../src/services/classService');

describe('ClassController', () => {
  let req, res, next;

  beforeEach(() => {
    // Create fresh mocks for each test
    ({ req, res, next } = createMockExpressContext());
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return 200 with all classes', async () => {
      // Arrange
      const mockClasses = [classes.valid];
      classService.getAllClasses.mockResolvedValue(mockClasses);

      // Act
      await classController.getAll(req, res, next);

      // Assert
      expect(classService.getAllClasses).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockClasses.length,
        data: mockClasses
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 200 with empty array when no classes', async () => {
      // Arrange
      classService.getAllClasses.mockResolvedValue([]);

      // Act
      await classController.getAll(req, res, next);

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
      classService.getAllClasses.mockRejectedValue(error);

      // Act
      await classController.getAll(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return 200 with class data', async () => {
      // Arrange
      req.params.id = mockIds.class1;
      classService.getClassById.mockResolvedValue(classes.valid);

      // Act
      await classController.getById(req, res, next);

      // Assert
      expect(classService.getClassById).toHaveBeenCalledWith(mockIds.class1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: classes.valid
      });
    });

    it('should call next with error when class not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      const error = new Error('Class not found');
      classService.getClassById.mockRejectedValue(error);

      // Act
      await classController.getById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle missing id parameter', async () => {
      // Arrange
      req.params.id = undefined;
      const error = new Error('Cast to ObjectId failed');
      classService.getClassById.mockRejectedValue(error);

      // Act
      await classController.getById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    it('should return 201 with created class', async () => {
      // Arrange
      req.body = { nom: 'CM2', prof: mockIds.teacher1 };
      const createdClass = { ...req.body, _id: mockIds.class2 };
      classService.createClass.mockResolvedValue(createdClass);

      // Act
      await classController.create(req, res, next);

      // Assert
      expect(classService.createClass).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdClass
      });
    });

    it('should call next with validation error', async () => {
      // Arrange
      req.body = { nom: '' };  // Invalid input
      const error = new Error('Validation failed');
      classService.createClass.mockRejectedValue(error);

      // Act
      await classController.create(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle empty request body', async () => {
      // Arrange
      req.body = {};
      const error = new Error('Missing required fields');
      classService.createClass.mockRejectedValue(error);

      // Act
      await classController.create(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('should return 200 with updated class', async () => {
      // Arrange
      req.params.id = mockIds.class1;
      req.body = { nom: 'Updated Name' };
      const updated = { ...classes.valid, nom: 'Updated Name' };
      classService.updateClass.mockResolvedValue(updated);

      // Act
      await classController.update(req, res, next);

      // Assert
      expect(classService.updateClass).toHaveBeenCalledWith(mockIds.class1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updated
      });
    });

    it('should call next when class not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      req.body = { nom: 'Test' };
      const error = new Error('Class not found');
      classService.updateClass.mockRejectedValue(error);

      // Act
      await classController.update(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('should return 200 with success message', async () => {
      // Arrange
      req.params.id = mockIds.class1;
      classService.deleteClass.mockResolvedValue(classes.valid);

      // Act
      await classController.delete(req, res, next);

      // Assert
      expect(classService.deleteClass).toHaveBeenCalledWith(mockIds.class1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Class deleted successfully'
      });
    });

    it('should call next when class not found', async () => {
      // Arrange
      req.params.id = edgeCases.nonExistentId;
      const error = new Error('Class not found');
      classService.deleteClass.mockRejectedValue(error);

      // Act
      await classController.delete(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
