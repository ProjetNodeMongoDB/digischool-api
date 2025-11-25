const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Student = require('../../src/models/Student');
const connectDB = require('../../src/config/database');

describe('Student API', () => {
  let testClassId;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean student collection
    await Student.deleteMany({});

    // Use a valid MongoDB ObjectId for class reference (mock)
    testClassId = new mongoose.Types.ObjectId();
  });

  describe('POST /api/students', () => {
    it('should create a new student', async () => {
      const studentData = {
        nom: 'Martin',
        prenom: 'Sophie',
        classe: testClassId.toString(),
        dateNaissance: '2010-03-20',
        adresse: '456 Avenue Victor Hugo, 75016 Paris',
        sexe: 'FEMME',
      };

      const response = await request(app)
        .post('/api/students')
        .send(studentData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.nom).toBe('Martin');
      expect(response.body.data.prenom).toBe('Sophie');
      expect(response.body.data.sexe).toBe('FEMME');
      // Class won't be populated since it doesn't exist
      expect(response.body.data.classe).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for invalid gender', async () => {
      const studentData = {
        nom: 'Martin',
        prenom: 'Sophie',
        classe: testClassId.toString(),
        dateNaissance: '2010-03-20',
        sexe: 'INVALID',
      };

      const response = await request(app)
        .post('/api/students')
        .send(studentData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid class ID format', async () => {
      const studentData = {
        nom: 'Martin',
        prenom: 'Sophie',
        classe: 'invalid-id',
        dateNaissance: '2010-03-20',
        sexe: 'FEMME',
      };

      const response = await request(app)
        .post('/api/students')
        .send(studentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for future birth date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const studentData = {
        nom: 'Martin',
        prenom: 'Sophie',
        classe: testClassId.toString(),
        dateNaissance: futureDate.toISOString(),
        sexe: 'FEMME',
      };

      const response = await request(app)
        .post('/api/students')
        .send(studentData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should create student without optional address', async () => {
      const studentData = {
        nom: 'Martin',
        prenom: 'Sophie',
        classe: testClassId.toString(),
        dateNaissance: '2010-03-20',
        sexe: 'FEMME',
      };

      const response = await request(app)
        .post('/api/students')
        .send(studentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.adresse).toBeUndefined();
    });
  });

  describe('GET /api/students', () => {
    it('should get all students', async () => {
      await Student.create([
        {
          nom: 'Martin',
          prenom: 'Sophie',
          classe: testClassId,
          dateNaissance: '2010-03-20',
          sexe: 'FEMME',
        },
        {
          nom: 'Dubois',
          prenom: 'Pierre',
          classe: testClassId,
          dateNaissance: '2011-05-15',
          sexe: 'HOMME',
        },
      ]);

      const response = await request(app)
        .get('/api/students')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when no students exist', async () => {
      const response = await request(app)
        .get('/api/students')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/students/:id', () => {
    it('should get a student by ID', async () => {
      const student = await Student.create({
        nom: 'Martin',
        prenom: 'Sophie',
        classe: testClassId,
        dateNaissance: '2010-03-20',
        sexe: 'FEMME',
      });

      const response = await request(app)
        .get(`/api/students/${student._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nom).toBe('Martin');
      expect(response.body.data.prenom).toBe('Sophie');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/students/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 500 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/students/${fakeId}`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/students/:id', () => {
    it('should update a student', async () => {
      const student = await Student.create({
        nom: 'Martin',
        prenom: 'Sophie',
        classe: testClassId,
        dateNaissance: '2010-03-20',
        sexe: 'FEMME',
      });

      const updateData = {
        nom: 'Martin',
        prenom: 'Marie',
        classe: testClassId.toString(),
        dateNaissance: '2010-03-20',
        sexe: 'FEMME',
      };

      const response = await request(app)
        .put(`/api/students/${student._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.prenom).toBe('Marie');
    });

    it('should return 400 for invalid update data', async () => {
      const student = await Student.create({
        nom: 'Martin',
        prenom: 'Sophie',
        classe: testClassId,
        dateNaissance: '2010-03-20',
        sexe: 'FEMME',
      });

      const updateData = {
        nom: 'Martin',
        prenom: 'Marie',
        classe: testClassId.toString(),
        dateNaissance: '2010-03-20',
        sexe: 'INVALID',
      };

      const response = await request(app)
        .put(`/api/students/${student._id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const updateData = {
        nom: 'Martin',
        prenom: 'Marie',
        classe: testClassId.toString(),
        dateNaissance: '2010-03-20',
        sexe: 'FEMME',
      };

      const response = await request(app)
        .put('/api/students/invalid-id')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should delete a student', async () => {
      const student = await Student.create({
        nom: 'Martin',
        prenom: 'Sophie',
        classe: testClassId,
        dateNaissance: '2010-03-20',
        sexe: 'FEMME',
      });

      const response = await request(app)
        .delete(`/api/students/${student._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Student deleted successfully');

      const deletedStudent = await Student.findById(student._id);
      expect(deletedStudent).toBeNull();
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .delete('/api/students/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 500 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/students/${fakeId}`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });
});
