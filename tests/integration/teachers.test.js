const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Teacher = require('../../src/models/Teacher');
const Class = require('../../src/models/Class');
const User = require('../../src/models/User');

describe('Teacher API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create a user and get auth token for protected routes
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'teacher-test-admin',
        email: 'teacher-tests@example.com',
        password: 'Test123456'
      });

    userId = registerResponse.body.data.user._id;
    authToken = registerResponse.body.data.token;

    // Update user role to admin for testing CRUD operations
    const User = require('../../src/models/User');
    await User.findByIdAndUpdate(userId, { role: 'admin' });
  });

  afterAll(async () => {
    // Clean up after tests
    await Teacher.deleteMany({});
    await Class.deleteMany({});
    await User.deleteMany({});
  });

  beforeEach(async () => {
    await Teacher.deleteMany({});
    await Class.deleteMany({});
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should get teacher by class ID', async () => {
      // Create a teacher
      const teacher = await Teacher.create({
        nom: 'Dupont',
        prenom: 'Jean',
        dateNaissance: '1980-05-15',
        sexe: 'HOMME',
      });

      // Create a class with this teacher
      const classe = await Class.create({
        nom: 'CM1-A',
        prof: teacher._id,
      });

      const response = await request(app)
        .get(`/api/teachers?classe=${classe._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]._id.toString()).toBe(teacher._id.toString());
      expect(response.body.data[0].nom).toBe('Dupont');
    });

    it('should return 500 when class does not exist (service throws, global error handler converts to 500)', async () => {
      const fakeClassId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/teachers?classe=${fakeClassId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid class ID format', async () => {
      const response = await request(app)
        .get('/api/teachers?classe=invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
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
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nom).toBe('Dupont');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/teachers/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 500 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/teachers/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Teacher deleted successfully');

      const deletedTeacher = await Teacher.findById(teacher._id);
      expect(deletedTeacher).toBeNull();
    });
  });
});
