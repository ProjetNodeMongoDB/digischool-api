const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Teacher = require('../../src/models/Teacher');
const Class = require('../../src/models/Class');
const User = require('../../src/models/User');
const Grade = require('../../src/models/Grade');
const Student = require('../../src/models/Student');
const Subject = require('../../src/models/Subject');
const Trimester = require('../../src/models/Trimester');

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

    it('should return 404 for non-existent class', async () => {
      const fakeClassId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/teachers?classe=${fakeClassId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Class not found');
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

  describe('GET /api/teachers/:teacherId/students-grades', () => {
    let teacherId, student1Id, student2Id, classId, subject1Id, subject2Id, trimesterId;

    beforeEach(async () => {
      // Clean up existing data
      await Grade.deleteMany({});
      await Student.deleteMany({});
      await Subject.deleteMany({});
      await Trimester.deleteMany({});
      await Class.deleteMany({});
      await Teacher.deleteMany({});

      // Create teacher
      const teacher = await Teacher.create({
        nom: 'Dupont',
        prenom: 'Jean',
        dateNaissance: '1980-05-15',
        adresse: '123 Rue de Paris',
        sexe: 'HOMME',
      });
      teacherId = teacher._id;

      // Create class
      const classe = await Class.create({
        nom: 'CM1',
        prof: teacherId,
      });
      classId = classe._id;

      // Create subjects
      const subject1 = await Subject.create({ nom: 'Mathématiques' });
      subject1Id = subject1._id;

      const subject2 = await Subject.create({ nom: 'Français' });
      subject2Id = subject2._id;

      // Create trimester
      const trimester = await Trimester.create({
        nom: 'Trim 1',
        date: new Date('2024-09-01')
      });
      trimesterId = trimester._id;

      // Create students
      const student1 = await Student.create({
        nom: 'Martin',
        prenom: 'Sophie',
        classe: classId,
        dateNaissance: '2015-05-20',
        sexe: 'FEMME',
      });
      student1Id = student1._id;

      const student2 = await Student.create({
        nom: 'Duplessis',
        prenom: 'Pierre',
        classe: classId,
        dateNaissance: '2015-08-15',
        sexe: 'HOMME',
      });
      student2Id = student2._id;

      // Create grades
      await Grade.create([
        {
          ideleve: student1Id,
          idclasse: classId,
          idmatiere: subject1Id,
          idprof: teacherId,
          idtrimestre: trimesterId,
          note: 15,
          coefficient: 2
        },
        {
          ideleve: student1Id,
          idclasse: classId,
          idmatiere: subject2Id,
          idprof: teacherId,
          idtrimestre: trimesterId,
          note: 12,
          coefficient: 1
        },
        {
          ideleve: student2Id,
          idclasse: classId,
          idmatiere: subject1Id,
          idprof: teacherId,
          idtrimestre: trimesterId,
          note: 18,
          coefficient: 2
        }
      ]);
    });

    it('should return students grouped with their grades', async () => {
      const response = await request(app)
        .get(`/api/teachers/${teacherId}/students-grades`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2); // 2 students
      expect(response.body.data).toHaveLength(2);

      // Verify structure
      const studentData = response.body.data[0];
      expect(studentData).toHaveProperty('student');
      expect(studentData).toHaveProperty('grades');
      expect(Array.isArray(studentData.grades)).toBe(true);

      // Verify student info
      expect(studentData.student).toHaveProperty('_id');
      expect(studentData.student).toHaveProperty('nom');
      expect(studentData.student).toHaveProperty('prenom');
      expect(studentData.student).toHaveProperty('dateNaissance');

      // Verify grade info
      expect(studentData.grades[0]).toHaveProperty('_id');
      expect(studentData.grades[0]).toHaveProperty('note');
      expect(studentData.grades[0]).toHaveProperty('coefficient');
      expect(studentData.grades[0]).toHaveProperty('matiere');
      expect(studentData.grades[0]).toHaveProperty('trimestre');
      expect(studentData.grades[0]).toHaveProperty('classe');
      expect(studentData.grades[0].matiere).toHaveProperty('nom');
    });

    it('should return empty array if teacher has no grades', async () => {
      const newTeacher = await Teacher.create({
        nom: 'Nouveau',
        prenom: 'Prof',
        dateNaissance: '1990-01-01',
        adresse: '789 Rue de Test',
        sexe: 'HOMME',
      });

      const response = await request(app)
        .get(`/api/teachers/${newTeacher._id}/students-grades`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });

    it('should return 400 for invalid teacher ID format', async () => {
      const response = await request(app)
        .get('/api/teachers/invalid-id/students-grades')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when teacher does not exist', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .get(`/api/teachers/${nonExistentId}/students-grades`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Teacher not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/teachers/${teacherId}/students-grades`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
