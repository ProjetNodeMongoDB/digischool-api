/**
 * Unit Tests for Trimester Service
 *
 * Tests academic trimester management for French school system organization.
 * Handles academic period creation, scheduling, and temporal data validation.
 *
 * Academic Period Management:
 * - Trimester creation with proper date validation
 * - Academic year organization (TRIM01, TRIM02, TRIM03)
 * - Chronological sorting by trimester dates
 * - Period modification and deletion operations
 *
 * Temporal Validation:
 * - Date format validation for trimester periods
 * - Chronological order enforcement
 * - Academic calendar integration
 * - Proper date range handling for grade assignments
 *
 * Mock Strategy:
 * - Trimester model isolated for unit testing
 * - Date validation simulation
 * - Database operation mocking
 * - Error scenario testing for invalid dates
 *
 * Academic Calendar Rules:
 * - Three trimesters per academic year (French system)
 * - Proper chronological ordering by date
 * - Trimester names follow TRIM01, TRIM02, TRIM03 convention
 * - Grade assignments tied to specific trimester periods
 */

const trimesterService = require('../../../src/services/trimesterService');
const Trimester = require('../../../src/models/Trimester');
const { trimesters, mockIds, edgeCases } = require('../mocks/fixtures');

jest.mock('../../../src/models/Trimester');

describe('TrimesterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTrimesters', () => {
    it('should return all trimesters sorted by date', async () => {
      const mockTrimesters = [trimesters.valid];
      Trimester.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTrimesters),
      });

      const result = await trimesterService.getAllTrimesters();

      expect(Trimester.find).toHaveBeenCalled();
      expect(result).toEqual(mockTrimesters);
    });

    it('should return empty array when no trimesters', async () => {
      Trimester.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const result = await trimesterService.getAllTrimesters();

      expect(result).toEqual([]);
    });

    it('should propagate database errors', async () => {
      Trimester.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(trimesterService.getAllTrimesters()).rejects.toThrow('DB error');
    });
  });

  describe('getTrimesterById', () => {
    it('should return trimester when found', async () => {
      Trimester.findById.mockResolvedValue(trimesters.valid);

      const result = await trimesterService.getTrimesterById(mockIds.trimester1);

      expect(Trimester.findById).toHaveBeenCalledWith(mockIds.trimester1);
      expect(result).toEqual(trimesters.valid);
    });

    it('should throw error when trimester not found', async () => {
      Trimester.findById.mockResolvedValue(null);

      await expect(trimesterService.getTrimesterById(edgeCases.nonExistentId))
        .rejects.toThrow('Trimester not found');
    });

    it('should handle invalid ObjectId format', async () => {
      Trimester.findById.mockRejectedValue(new Error('Cast to ObjectId failed'));

      await expect(trimesterService.getTrimesterById(edgeCases.invalidObjectId))
        .rejects.toThrow('Cast to ObjectId failed');
    });

    it('should propagate database errors', async () => {
      Trimester.findById.mockRejectedValue(new Error('Connection timeout'));

      await expect(trimesterService.getTrimesterById(mockIds.trimester1))
        .rejects.toThrow('Connection timeout');
    });
  });

  describe('createTrimester', () => {
    it('should create and return new trimester', async () => {
      const newData = trimesters.validInput;
      const savedTrimester = { ...newData, _id: mockIds.trimester2 };

      Trimester.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedTrimester),
      }));

      const result = await trimesterService.createTrimester(newData);

      expect(Trimester).toHaveBeenCalledWith(newData);
      expect(result).toEqual(savedTrimester);
    });

    it('should handle Mongoose validation errors', async () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      Trimester.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await expect(trimesterService.createTrimester(trimesters.invalid))
        .rejects.toThrow('Validation failed');
    });

    it('should handle invalid date', async () => {
      const invalidData = { ...trimesters.validInput, date: 'invalid-date' };
      const error = new Error('Cast to Date failed');

      Trimester.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await expect(trimesterService.createTrimester(invalidData))
        .rejects.toThrow('Cast to Date failed');
    });

    it('should propagate database errors', async () => {
      Trimester.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('DB error')),
      }));

      await expect(trimesterService.createTrimester(trimesters.validInput))
        .rejects.toThrow('DB error');
    });
  });

  describe('updateTrimester', () => {
    it('should update and return trimester', async () => {
      const updateData = { nom: 'T3' };
      const updated = { ...trimesters.valid, ...updateData };

      Trimester.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await trimesterService.updateTrimester(mockIds.trimester1, updateData);

      expect(Trimester.findByIdAndUpdate).toHaveBeenCalledWith(
        mockIds.trimester1,
        updateData,
        { new: true, runValidators: true }
      );
      expect(result.nom).toBe('T3');
    });

    it('should throw error when trimester not found', async () => {
      Trimester.findByIdAndUpdate.mockResolvedValue(null);

      await expect(trimesterService.updateTrimester(edgeCases.nonExistentId, {}))
        .rejects.toThrow('Trimester not found');
    });

    it('should validate update data', async () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      Trimester.findByIdAndUpdate.mockRejectedValue(error);

      await expect(trimesterService.updateTrimester(mockIds.trimester1, trimesters.invalid))
        .rejects.toThrow('Validation failed');
    });

    it('should propagate database errors', async () => {
      Trimester.findByIdAndUpdate.mockRejectedValue(new Error('DB error'));

      await expect(trimesterService.updateTrimester(mockIds.trimester1, {}))
        .rejects.toThrow('DB error');
    });
  });

  describe('deleteTrimester', () => {
    it('should delete and return trimester', async () => {
      Trimester.findByIdAndDelete.mockResolvedValue(trimesters.valid);

      const result = await trimesterService.deleteTrimester(mockIds.trimester1);

      expect(Trimester.findByIdAndDelete).toHaveBeenCalledWith(mockIds.trimester1);
      expect(result).toEqual(trimesters.valid);
    });

    it('should throw error when trimester not found', async () => {
      Trimester.findByIdAndDelete.mockResolvedValue(null);

      await expect(trimesterService.deleteTrimester(edgeCases.nonExistentId))
        .rejects.toThrow('Trimester not found');
    });

    it('should propagate database errors', async () => {
      Trimester.findByIdAndDelete.mockRejectedValue(new Error('DB error'));

      await expect(trimesterService.deleteTrimester(mockIds.trimester1))
        .rejects.toThrow('DB error');
    });
  });
});
