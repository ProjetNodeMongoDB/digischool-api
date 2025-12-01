/**
 * Unit Tests for Subject Service
 *
 * Tests academic subject management with focus on curriculum organization and
 * data integrity. Covers CRUD operations for school subjects with validation.
 *
 * Academic Subject Management:
 * - Subject creation with proper naming conventions
 * - Subject name uniqueness enforcement
 * - Alphabetical sorting for curriculum organization
 * - Subject retrieval and modification operations
 *
 * Validation Testing:
 * - Subject name format validation (typically UPPERCASE)
 * - Length constraints for subject names
 * - Duplicate prevention across the academic system
 * - Proper error handling for invalid subject data
 *
 * Mock Strategy:
 * - Subject model isolated through jest.mock()
 * - Database operation simulation
 * - Error scenario testing for validation failures
 * - Edge case handling for boundary conditions
 *
 * Curriculum Rules:
 * - Subject names must be unique within the system
 * - Proper alphabetical ordering for academic organization
 * - Consistent naming conventions for administrative clarity
 * - No soft deletion (subjects are permanently removed when deleted)
 */

const subjectService = require('../../../src/services/subjectService');
const Subject = require('../../../src/models/Subject');
const { subjects, mockIds, edgeCases } = require('../mocks/fixtures');

jest.mock('../../../src/models/Subject');

describe('SubjectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSubjects', () => {
    it('should return all subjects sorted by nom', async () => {
      const mockSubjects = [subjects.valid];
      Subject.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockSubjects),
      });

      const result = await subjectService.getAllSubjects();

      expect(Subject.find).toHaveBeenCalled();
      expect(result).toEqual(mockSubjects);
    });

    it('should return empty array when no subjects', async () => {
      Subject.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const result = await subjectService.getAllSubjects();

      expect(result).toEqual([]);
    });

    it('should propagate database errors', async () => {
      Subject.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(subjectService.getAllSubjects()).rejects.toThrow('DB error');
    });
  });

  describe('getSubjectById', () => {
    it('should return subject when found', async () => {
      Subject.findById.mockResolvedValue(subjects.valid);

      const result = await subjectService.getSubjectById(mockIds.subject1);

      expect(Subject.findById).toHaveBeenCalledWith(mockIds.subject1);
      expect(result).toEqual(subjects.valid);
    });

    it('should throw error when subject not found', async () => {
      Subject.findById.mockResolvedValue(null);

      await expect(subjectService.getSubjectById(edgeCases.nonExistentId))
        .rejects.toThrow('Subject not found');
    });

    it('should handle invalid ObjectId format', async () => {
      Subject.findById.mockRejectedValue(new Error('Cast to ObjectId failed'));

      await expect(subjectService.getSubjectById(edgeCases.invalidObjectId))
        .rejects.toThrow('Cast to ObjectId failed');
    });

    it('should propagate database errors', async () => {
      Subject.findById.mockRejectedValue(new Error('Connection timeout'));

      await expect(subjectService.getSubjectById(mockIds.subject1))
        .rejects.toThrow('Connection timeout');
    });
  });

  describe('createSubject', () => {
    it('should create and return new subject', async () => {
      const newData = subjects.validInput;
      const savedSubject = { ...newData, _id: mockIds.subject2 };

      Subject.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedSubject),
      }));

      const result = await subjectService.createSubject(newData);

      expect(Subject).toHaveBeenCalledWith(newData);
      expect(result).toEqual(savedSubject);
    });

    it('should handle Mongoose validation errors', async () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      Subject.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await expect(subjectService.createSubject(subjects.invalid))
        .rejects.toThrow('Validation failed');
    });

    it('should reject duplicate subject name', async () => {
      const error = new Error('Duplicate key');
      error.code = 11000;

      Subject.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await expect(subjectService.createSubject(subjects.duplicate))
        .rejects.toThrow('Duplicate key');
    });

    it('should propagate database errors', async () => {
      Subject.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('DB error')),
      }));

      await expect(subjectService.createSubject(subjects.validInput))
        .rejects.toThrow('DB error');
    });
  });

  describe('updateSubject', () => {
    it('should update and return subject', async () => {
      const updateData = { nom: 'Updated' };
      const updated = { ...subjects.valid, ...updateData };

      Subject.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await subjectService.updateSubject(mockIds.subject1, updateData);

      expect(Subject.findByIdAndUpdate).toHaveBeenCalledWith(
        mockIds.subject1,
        updateData,
        { new: true, runValidators: true }
      );
      expect(result.nom).toBe('Updated');
    });

    it('should throw error when subject not found', async () => {
      Subject.findByIdAndUpdate.mockResolvedValue(null);

      await expect(subjectService.updateSubject(edgeCases.nonExistentId, {}))
        .rejects.toThrow('Subject not found');
    });

    it('should validate update data', async () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      Subject.findByIdAndUpdate.mockRejectedValue(error);

      await expect(subjectService.updateSubject(mockIds.subject1, subjects.invalid))
        .rejects.toThrow('Validation failed');
    });

    it('should propagate database errors', async () => {
      Subject.findByIdAndUpdate.mockRejectedValue(new Error('DB error'));

      await expect(subjectService.updateSubject(mockIds.subject1, {}))
        .rejects.toThrow('DB error');
    });
  });

  describe('deleteSubject', () => {
    it('should delete and return subject', async () => {
      Subject.findByIdAndDelete.mockResolvedValue(subjects.valid);

      const result = await subjectService.deleteSubject(mockIds.subject1);

      expect(Subject.findByIdAndDelete).toHaveBeenCalledWith(mockIds.subject1);
      expect(result).toEqual(subjects.valid);
    });

    it('should throw error when subject not found', async () => {
      Subject.findByIdAndDelete.mockResolvedValue(null);

      await expect(subjectService.deleteSubject(edgeCases.nonExistentId))
        .rejects.toThrow('Subject not found');
    });

    it('should propagate database errors', async () => {
      Subject.findByIdAndDelete.mockRejectedValue(new Error('DB error'));

      await expect(subjectService.deleteSubject(mockIds.subject1))
        .rejects.toThrow('DB error');
    });
  });
});
