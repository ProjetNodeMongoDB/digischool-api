const classService = require('../../../src/services/classService');
const Class = require('../../../src/models/Class');
const Teacher = require('../../../src/models/Teacher');
const { classes, teachers, mockIds, edgeCases } = require('../mocks/fixtures');

jest.mock('../../../src/models/Class');
jest.mock('../../../src/models/Teacher');

describe('ClassService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllClasses', () => {
    it('should return all classes with populated prof sorted by nom', async () => {
      const mockClasses = [classes.validWithPopulate];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockClasses),
      };
      Class.find.mockReturnValue(mockQuery);

      const result = await classService.getAllClasses();

      expect(Class.find).toHaveBeenCalled();
      expect(mockQuery.populate).toHaveBeenCalledWith('prof', 'nom prenom');
      expect(result).toEqual(mockClasses);
    });

    it('should return empty array when no classes', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([]),
      };
      Class.find.mockReturnValue(mockQuery);

      const result = await classService.getAllClasses();

      expect(result).toEqual([]);
    });

    it('should propagate database errors', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('DB error')),
      };
      Class.find.mockReturnValue(mockQuery);

      await expect(classService.getAllClasses()).rejects.toThrow('DB error');
    });
  });

  describe('getClassById', () => {
    it('should return class with populated prof when found', async () => {
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(classes.validWithPopulate),
      };
      Class.findById.mockReturnValue(mockQuery);

      const result = await classService.getClassById(mockIds.class1);

      expect(Class.findById).toHaveBeenCalledWith(mockIds.class1);
      expect(mockQuery.populate).toHaveBeenCalledWith('prof', 'nom prenom');
      expect(result).toEqual(classes.validWithPopulate);
      expect(result.prof.nom).toBe('Dupont');
    });

    it('should throw error when class not found', async () => {
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(null),
      };
      Class.findById.mockReturnValue(mockQuery);

      await expect(classService.getClassById(edgeCases.nonExistentId))
        .rejects.toThrow('Class not found');
    });

    it('should handle invalid ObjectId format', async () => {
      const mockQuery = {
        populate: jest.fn().mockRejectedValue(new Error('Cast to ObjectId failed')),
      };
      Class.findById.mockReturnValue(mockQuery);

      await expect(classService.getClassById(edgeCases.invalidObjectId))
        .rejects.toThrow('Cast to ObjectId failed');
    });

    it('should propagate database errors', async () => {
      const mockQuery = {
        populate: jest.fn().mockRejectedValue(new Error('Connection timeout')),
      };
      Class.findById.mockReturnValue(mockQuery);

      await expect(classService.getClassById(mockIds.class1))
        .rejects.toThrow('Connection timeout');
    });
  });

  describe('createClass', () => {
    it('should create and return new class with populated prof', async () => {
      const newData = classes.validInput;
      const savedClass = { ...newData, _id: mockIds.class2 };

      Teacher.findById.mockResolvedValue(teachers.valid);

      Class.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedClass),
      }));

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(classes.validWithPopulate),
      };
      Class.findById.mockReturnValue(mockQuery);

      const result = await classService.createClass(newData);

      expect(Teacher.findById).toHaveBeenCalledWith(newData.prof);
      expect(Class).toHaveBeenCalledWith(newData);
      expect(result).toEqual(classes.validWithPopulate);
    });

    it('should throw error when teacher not found', async () => {
      Teacher.findById.mockResolvedValue(null);

      await expect(classService.createClass(classes.validInput))
        .rejects.toThrow('Teacher not found');
    });

    it('should handle Mongoose validation errors', async () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      Teacher.findById.mockResolvedValue(teachers.valid);

      Class.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await expect(classService.createClass(classes.invalid))
        .rejects.toThrow('Validation failed');
    });

    it('should handle duplicate class name', async () => {
      const error = new Error('Duplicate key');
      error.code = 11000;

      Teacher.findById.mockResolvedValue(teachers.valid);

      Class.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await expect(classService.createClass(classes.duplicate))
        .rejects.toThrow('Duplicate key');
    });
  });

  describe('updateClass', () => {
    it('should update and return class with populated prof', async () => {
      const updateData = { nom: 'Updated' };
      const updated = { ...classes.validWithPopulate, ...updateData };

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(updated),
      };
      Class.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await classService.updateClass(mockIds.class1, updateData);

      expect(Class.findByIdAndUpdate).toHaveBeenCalledWith(
        mockIds.class1,
        updateData,
        { new: true, runValidators: true }
      );
      expect(result.nom).toBe('Updated');
    });

    it('should validate teacher exists when updating prof', async () => {
      const updateData = { prof: mockIds.teacher2 };
      const updated = { ...classes.validWithPopulate, ...updateData };

      Teacher.findById.mockResolvedValue(teachers.valid);

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(updated),
      };
      Class.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await classService.updateClass(mockIds.class1, updateData);

      expect(Teacher.findById).toHaveBeenCalledWith(updateData.prof);
      expect(result).toEqual(updated);
    });

    it('should throw error when teacher not found during update', async () => {
      const updateData = { prof: mockIds.teacher2 };
      Teacher.findById.mockResolvedValue(null);

      await expect(classService.updateClass(mockIds.class1, updateData))
        .rejects.toThrow('Teacher not found');
    });

    it('should throw error when class not found', async () => {
      const updateData = { nom: 'Updated' };

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(null),
      };
      Class.findByIdAndUpdate.mockReturnValue(mockQuery);

      await expect(classService.updateClass(edgeCases.nonExistentId, updateData))
        .rejects.toThrow('Class not found');
    });

    it('should propagate database errors', async () => {
      const mockQuery = {
        populate: jest.fn().mockRejectedValue(new Error('DB error')),
      };
      Class.findByIdAndUpdate.mockReturnValue(mockQuery);

      await expect(classService.updateClass(mockIds.class1, {}))
        .rejects.toThrow('DB error');
    });
  });

  describe('deleteClass', () => {
    it('should delete and return class', async () => {
      Class.findByIdAndDelete.mockResolvedValue(classes.valid);

      const result = await classService.deleteClass(mockIds.class1);

      expect(Class.findByIdAndDelete).toHaveBeenCalledWith(mockIds.class1);
      expect(result).toEqual(classes.valid);
    });

    it('should throw error when class not found', async () => {
      Class.findByIdAndDelete.mockResolvedValue(null);

      await expect(classService.deleteClass(edgeCases.nonExistentId))
        .rejects.toThrow('Class not found');
    });

    it('should propagate database errors', async () => {
      Class.findByIdAndDelete.mockRejectedValue(new Error('DB error'));

      await expect(classService.deleteClass(mockIds.class1))
        .rejects.toThrow('DB error');
    });
  });
});
