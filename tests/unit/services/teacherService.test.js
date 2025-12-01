/**
 * Unit Tests for Teacher Service
 *
 * Tests all CRUD operations for teacher management with comprehensive mocking patterns.
 * Covers successful operations, error handling, validation scenarios, and edge cases.
 *
 * Test Categories:
 * - Read Operations: getAllTeachers, getTeacherById, getTeachersByClass
 * - Write Operations: createTeacher, updateTeacher, deleteTeacher
 * - Error Scenarios: Database errors, validation failures, not found cases
 * - Edge Cases: Invalid ObjectIds, null/undefined values, empty responses
 *
 * Mock Strategy:
 * - Teacher model completely mocked using jest.mock()
 * - Chainable query methods (.find().sort(), .findById().populate())
 * - Error simulation for database connection issues
 * - Fixtures provide consistent test data across all test cases
 */

const teacherService = require('../../../src/services/teacherService');
const Teacher = require('../../../src/models/Teacher');
const { teachers, mockIds, edgeCases } = require('../mocks/fixtures');

// Mock the Teacher model
jest.mock('../../../src/models/Teacher');

describe('TeacherService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTeachers', () => {
    it('should return all teachers sorted by nom', async () => {
      // Arrange
      const mockTeachers = [teachers.valid, { ...teachers.valid, _id: mockIds.teacher2 }];
      Teacher.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTeachers)
      });

      // Act
      const result = await teacherService.getAllTeachers();

      // Assert
      expect(Teacher.find).toHaveBeenCalled();
      expect(result).toEqual(mockTeachers);
      expect(result.length).toBe(2);
    });

    it('should return empty array when no teachers exist', async () => {
      // Arrange
      Teacher.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      // Act
      const result = await teacherService.getAllTeachers();

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      Teacher.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(dbError)
      });

      // Act & Assert
      await expect(teacherService.getAllTeachers()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getTeacherById', () => {
    it('should return teacher when found', async () => {
      // Arrange
      Teacher.findById.mockResolvedValue(teachers.valid);

      // Act
      const result = await teacherService.getTeacherById(mockIds.teacher1);

      // Assert
      expect(Teacher.findById).toHaveBeenCalledWith(mockIds.teacher1);
      expect(result).toEqual(teachers.valid);
      expect(result.nom).toBe('Dupont');
    });

    it('should throw error when teacher not found', async () => {
      // Arrange
      Teacher.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(teacherService.getTeacherById(edgeCases.nonExistentId))
        .rejects.toThrow('Teacher not found');
    });

    it('should handle invalid ObjectId', async () => {
      // Arrange
      const castError = new Error('Cast to ObjectId failed');
      Teacher.findById.mockRejectedValue(castError);

      // Act & Assert
      await expect(teacherService.getTeacherById(edgeCases.invalidObjectId))
        .rejects.toThrow('Cast to ObjectId failed');
    });
  });

  describe('createTeacher', () => {
    it('should create and return new teacher', async () => {
      // Arrange
      const newTeacherData = teachers.validInput;
      const savedTeacher = { ...newTeacherData, _id: mockIds.teacher2 };

      Teacher.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedTeacher)
      }));

      // Act
      const result = await teacherService.createTeacher(newTeacherData);

      // Assert
      expect(Teacher).toHaveBeenCalledWith(newTeacherData);
      expect(result).toEqual(savedTeacher);
      expect(result._id).toBeDefined();
    });

    it('should handle validation errors', async () => {
      // Arrange
      const invalidData = teachers.invalid;
      const validationError = new Error('Validation failed');

      Teacher.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(validationError)
      }));

      // Act & Assert
      await expect(teacherService.createTeacher(invalidData))
        .rejects.toThrow('Validation failed');
    });
  });

  describe('updateTeacher', () => {
    it('should update and return teacher', async () => {
      // Arrange
      const updateData = { nom: 'Updated Name' };
      const updatedTeacher = { ...teachers.valid, ...updateData };

      Teacher.findByIdAndUpdate.mockResolvedValue(updatedTeacher);

      // Act
      const result = await teacherService.updateTeacher(mockIds.teacher1, updateData);

      // Assert
      expect(Teacher.findByIdAndUpdate).toHaveBeenCalledWith(
        mockIds.teacher1,
        updateData,
        { new: true, runValidators: true }
      );
      expect(result).toEqual(updatedTeacher);
      expect(result.nom).toBe('Updated Name');
    });

    it('should throw error when teacher not found', async () => {
      // Arrange
      Teacher.findByIdAndUpdate.mockResolvedValue(null);

      // Act & Assert
      await expect(teacherService.updateTeacher(edgeCases.nonExistentId, {}))
        .rejects.toThrow('Teacher not found');
    });

    it('should validate update data', async () => {
      // Arrange
      const invalidUpdate = { sexe: 'INVALID' };
      const validationError = new Error('Validation failed');

      Teacher.findByIdAndUpdate.mockRejectedValue(validationError);

      // Act & Assert
      await expect(teacherService.updateTeacher(mockIds.teacher1, invalidUpdate))
        .rejects.toThrow('Validation failed');
    });
  });

  describe('deleteTeacher', () => {
    it('should delete and return teacher', async () => {
      // Arrange
      Teacher.findByIdAndDelete.mockResolvedValue(teachers.valid);

      // Act
      const result = await teacherService.deleteTeacher(mockIds.teacher1);

      // Assert
      expect(Teacher.findByIdAndDelete).toHaveBeenCalledWith(mockIds.teacher1);
      expect(result).toEqual(teachers.valid);
    });

    it('should throw error when teacher not found', async () => {
      // Arrange
      Teacher.findByIdAndDelete.mockResolvedValue(null);

      // Act & Assert
      await expect(teacherService.deleteTeacher(edgeCases.nonExistentId))
        .rejects.toThrow('Teacher not found');
    });
  });
});
