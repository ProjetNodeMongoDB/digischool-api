const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Teacher = require('../../src/models/Teacher');
const connectDB = require('../../src/config/database');

describe('Teacher API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Teacher.deleteMany({});
  });

  describe('POST /api/teachers', () => {
    it('should create a new teacher', async () => {
      const teacherData = {
        nom: 'Dupont',
        prenom: 'Jean',
        dateNaissance: '1980-05-15',
        adresse: '123 Rue de Paris',
        sexe: 'HOMME',
      };

      const response = await request(app)
        .post('/api/teachers')
        .send(teacherData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.nom).toBe('Dupont');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/teachers')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for invalid gender', async () => {
      const teacherData = {
        nom: 'Dupont',
        prenom: 'Jean',
        dateNaissance: '1980-05-15',
        sexe: 'INVALID',
      };

      const response = await request(app)
        .post('/api/teachers')
        .send(teacherData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/teachers', () => {
    it('should get all teachers', async () => {
      await Teacher.create([
        {
          nom: 'Dupont',
          prenom: 'Jean',
          dateNaissance: '1980-05-15',
          sexe: 'HOMME',
        },
        {
          nom: 'Martin',
          prenom: 'Marie',
          dateNaissance: '1985-03-20',
          sexe: 'FEMME',
        },
      ]);

      const response = await request(app)
        .get('/api/teachers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/teachers/:id', () => {
    it('should get a teacher by ID', async () => {
      const teacher = await Teacher.create({
        nom: 'Dupont',
        prenom: 'Jean',
        dateNaissance: '1980-05-15',
        sexe: 'HOMME',
      });

      const response = await request(app)
        .get(`/api/teachers/${teacher._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nom).toBe('Dupont');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/teachers/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 500 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/teachers/${fakeId}`)
        .expect(500);
    });
  });

  describe('PUT /api/teachers/:id', () => {
    it('should update a teacher', async () => {
      const teacher = await Teacher.create({
        nom: 'Dupont',
        prenom: 'Jean',
        dateNaissance: '1980-05-15',
        sexe: 'HOMME',
      });

      const updateData = {
        nom: 'Dupont',
        prenom: 'Pierre',
        dateNaissance: '1980-05-15',
        sexe: 'HOMME',
      };

      const response = await request(app)
        .put(`/api/teachers/${teacher._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.prenom).toBe('Pierre');
    });
  });

  describe('DELETE /api/teachers/:id', () => {
    it('should delete a teacher', async () => {
      const teacher = await Teacher.create({
        nom: 'Dupont',
        prenom: 'Jean',
        dateNaissance: '1980-05-15',
        sexe: 'HOMME',
      });

      const response = await request(app)
        .delete(`/api/teachers/${teacher._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Teacher deleted successfully');

      const deletedTeacher = await Teacher.findById(teacher._id);
      expect(deletedTeacher).toBeNull();
    });
  });
});
