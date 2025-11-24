const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Trimester = require('../../src/models/Trimester');
const connectDB = require('../../src/config/database');

describe('Trimester API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Trimester.deleteMany({});
  });

  describe('POST /api/trimesters', () => {
    it('should create a new trimester', async () => {
      const trimesterData = {
        nom: 'T1',
        date: '2024-09-01',
      };

      const response = await request(app)
        .post('/api/trimesters')
        .send(trimesterData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.nom).toBe('T1');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/trimesters')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for invalid date format', async () => {
      const trimesterData = {
        nom: 'T1',
        date: 'invalid-date',
      };

      const response = await request(app)
        .post('/api/trimesters')
        .send(trimesterData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for trimester name exceeding max length', async () => {
      const trimesterData = {
        nom: 'This is a very long trimester name',
        date: '2024-09-01',
      };

      const response = await request(app)
        .post('/api/trimesters')
        .send(trimesterData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/trimesters', () => {
    it('should get all trimesters', async () => {
      await Trimester.create([
        {
          nom: 'T1',
          date: '2024-09-01',
        },
        {
          nom: 'T2',
          date: '2025-01-01',
        },
      ]);

      const response = await request(app)
        .get('/api/trimesters')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when no trimesters exist', async () => {
      const response = await request(app)
        .get('/api/trimesters')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/trimesters/:id', () => {
    it('should get a trimester by ID', async () => {
      const trimester = await Trimester.create({
        nom: 'T1',
        date: '2024-09-01',
      });

      const response = await request(app)
        .get(`/api/trimesters/${trimester._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nom).toBe('T1');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/trimesters/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 500 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/trimesters/${fakeId}`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/trimesters/:id', () => {
    it('should update a trimester', async () => {
      const trimester = await Trimester.create({
        nom: 'T1',
        date: '2024-09-01',
      });

      const updateData = {
        nom: 'T2',
        date: '2025-01-01',
      };

      const response = await request(app)
        .put(`/api/trimesters/${trimester._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nom).toBe('T2');
    });

    it('should return 400 for invalid update data', async () => {
      const trimester = await Trimester.create({
        nom: 'T1',
        date: '2024-09-01',
      });

      const updateData = {
        nom: 'This is a very long trimester name that exceeds the max length',
      };

      const response = await request(app)
        .put(`/api/trimesters/${trimester._id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/trimesters/:id', () => {
    it('should delete a trimester', async () => {
      const trimester = await Trimester.create({
        nom: 'T1',
        date: '2024-09-01',
      });

      const response = await request(app)
        .delete(`/api/trimesters/${trimester._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Trimester deleted successfully');

      const deletedTrimester = await Trimester.findById(trimester._id);
      expect(deletedTrimester).toBeNull();
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .delete('/api/trimesters/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
