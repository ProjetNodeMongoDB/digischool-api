const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Student = require('../../src/models/Student');
const Class = require('../../src/models/Class');
const Teacher = require('../../src/models/Teacher');
const User = require('../../src/models/User');

describe('Student API', () => {
  let testClassId;
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create a user and get auth token for protected routes
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'student-test-admin',
        email: 'student-tests@example.com',
        password: 'Test123456'
      });

    userId = registerResponse.body.data.user._id;
    authToken = registerResponse.body.data.token;

    // Update user role to admin for testing CRUD operations
    // First, we need to create an admin user to update roles
    // For tests, we'll use a workaround by directly updating via User model
    const User = require('../../src/models/User');
    await User.findByIdAndUpdate(userId, { role: 'admin' });
  });

  afterAll(async () => {
    // Clean up after tests
    await Student.deleteMany({});
    await User.deleteMany({});
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when no students exist', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toHaveLength(0);
    });

    it('should get students by class ID', async () => {
      const Class = require('../../src/models/Class');
      const Teacher = require('../../src/models/Teacher');

      // Create a real teacher and class for the test
      const teacher = await Teacher.create({
        nom: 'Dupont',
        prenom: 'Jean',
        sexe: 'HOMME',
        dateNaissance: '1980-05-15',
        lieuNaissance: 'Paris',
        telephone: '0123456789'
      });

      const realClass = await Class.create({
        nom: 'Test Class for Students',
        prof: teacher._id
      });

      const anotherClassId = new mongoose.Types.ObjectId();

      await Student.create([
        {
          nom: 'Martin',
          prenom: 'Sophie',
          classe: realClass._id,
          dateNaissance: '2010-03-20',
          sexe: 'FEMME',
        },
        {
          nom: 'Dubois',
          prenom: 'Pierre',
          classe: realClass._id,
          dateNaissance: '2011-05-15',
          sexe: 'HOMME',
        },
        {
          nom: 'Garcia',
          prenom: 'Juan',
          classe: anotherClassId,
          dateNaissance: '2010-08-10',
          sexe: 'HOMME',
        },
      ]);

      const response = await request(app)
        .get(`/api/students?classe=${realClass._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].nom).toBe('Dubois');
      expect(response.body.data[1].nom).toBe('Martin');

      // Cleanup
      await Class.findByIdAndDelete(realClass._id);
      await Teacher.findByIdAndDelete(teacher._id);
    });

    it('should return students sorted by nom and prenom', async () => {
      // Create students with same last name but different first names
      await Student.create([
        {
          nom: 'Dupont',
          prenom: 'Zoe',
          classe: testClassId,
          dateNaissance: '2011-01-15',
          sexe: 'FEMME',
        },
        {
          nom: 'Dupont',
          prenom: 'Alice',
          classe: testClassId,
          dateNaissance: '2011-02-20',
          sexe: 'FEMME',
        },
        {
          nom: 'Bernard',
          prenom: 'Marc',
          classe: testClassId,
          dateNaissance: '2011-03-10',
          sexe: 'HOMME',
        },
      ]);

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      // Verify sorting: Bernard Marc, then Dupont Alice, then Dupont Zoe
      expect(response.body.data[0].nom).toBe('Bernard');
      expect(response.body.data[0].prenom).toBe('Marc');
      expect(response.body.data[1].nom).toBe('Dupont');
      expect(response.body.data[1].prenom).toBe('Alice');
      expect(response.body.data[2].nom).toBe('Dupont');
      expect(response.body.data[2].prenom).toBe('Zoe');
    });

    it('should return 404 for non-existent class', async () => {
      const fakeClassId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/students?classe=${fakeClassId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Class not found');
    });

    it('should return empty array for class with no students', async () => {
      const Class = require('../../src/models/Class');
      const Teacher = require('../../src/models/Teacher');

      // Create a real teacher
      const teacher = await Teacher.create({
        nom: 'Dupont',
        prenom: 'Jean',
        sexe: 'HOMME',
        dateNaissance: '1980-05-15',
        lieuNaissance: 'Paris',
        telephone: '0123456789'
      });

      // Create a real class with no students
      const emptyClass = await Class.create({
        nom: 'Empty Class',
        prof: teacher._id
      });

      const response = await request(app)
        .get(`/api/students?classe=${emptyClass._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toHaveLength(0);

      // Cleanup
      await Class.findByIdAndDelete(emptyClass._id);
      await Teacher.findByIdAndDelete(teacher._id);
    });

    it('should return 400 for invalid class ID format', async () => {
      const response = await request(app)
        .get('/api/students?classe=invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
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
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nom).toBe('Martin');
      expect(response.body.data.prenom).toBe('Sophie');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/students/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 500 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/students/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Student deleted successfully');

      const deletedStudent = await Student.findById(student._id);
      expect(deletedStudent).toBeNull();
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .delete('/api/students/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 500 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/students/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/students?groupBy=class', () => {
    let class1Id, class2Id, teacher1Id, teacher2Id;

    beforeEach(async () => {
      // Clean up existing data
      await Student.deleteMany({});
      await Class.deleteMany({});
      await Teacher.deleteMany({});

      // Create teachers
      const teacher1 = await Teacher.create({
        nom: 'Dupont',
        prenom: 'Jean',
        dateNaissance: '1980-05-15',
        adresse: '123 Rue de Paris',
        sexe: 'HOMME',
      });
      teacher1Id = teacher1._id;

      const teacher2 = await Teacher.create({
        nom: 'Martin',
        prenom: 'Marie',
        dateNaissance: '1985-03-20',
        adresse: '456 Avenue Test',
        sexe: 'FEMME',
      });
      teacher2Id = teacher2._id;

      // Create classes
      const class1 = await Class.create({
        nom: 'CM1',
        prof: teacher1Id,
      });
      class1Id = class1._id;

      const class2 = await Class.create({
        nom: 'CM2',
        prof: teacher2Id,
      });
      class2Id = class2._id;

      // Create students
      await Student.create([
        {
          nom: 'Martin',
          prenom: 'Sophie',
          classe: class1Id,
          dateNaissance: '2015-05-20',
          sexe: 'FEMME',
        },
        {
          nom: 'Duplessis',
          prenom: 'Pierre',
          classe: class1Id,
          dateNaissance: '2015-08-15',
          sexe: 'HOMME',
        },
        {
          nom: 'Bernard',
          prenom: 'Alice',
          classe: class2Id,
          dateNaissance: '2014-03-10',
          sexe: 'FEMME',
        }
      ]);
    });

    it('should return students grouped by class', async () => {
      const response = await request(app)
        .get('/api/students?groupBy=class')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2); // 2 classes
      expect(response.body.totalStudents).toBe(3); // 3 total students
      expect(response.body.data).toHaveLength(2);

      // Verify structure
      const classGroup = response.body.data[0];
      expect(classGroup).toHaveProperty('class');
      expect(classGroup).toHaveProperty('students');
      expect(Array.isArray(classGroup.students)).toBe(true);

      // Verify class info
      expect(classGroup.class).toHaveProperty('_id');
      expect(classGroup.class).toHaveProperty('nom');
      expect(classGroup.class).toHaveProperty('prof');
      expect(classGroup.class.prof).toHaveProperty('nom');
      expect(classGroup.class.prof).toHaveProperty('prenom');

      // Verify student info
      expect(classGroup.students[0]).toHaveProperty('_id');
      expect(classGroup.students[0]).toHaveProperty('nom');
      expect(classGroup.students[0]).toHaveProperty('prenom');
      expect(classGroup.students[0]).toHaveProperty('dateNaissance');
    });

    it('should return correct number of students per class', async () => {
      const response = await request(app)
        .get('/api/students?groupBy=class')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Find CM1 class in response
      const cm1Class = response.body.data.find(c => c.class.nom === 'CM1');
      expect(cm1Class.students).toHaveLength(2);

      // Find CM2 class in response
      const cm2Class = response.body.data.find(c => c.class.nom === 'CM2');
      expect(cm2Class.students).toHaveLength(1);
    });

    it('should return empty array when no students exist', async () => {
      await Student.deleteMany({});

      const response = await request(app)
        .get('/api/students?groupBy=class')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.totalStudents).toBe(0);
      expect(response.body.data).toEqual([]);
    });

    it('should return 400 for invalid groupBy value', async () => {
      const response = await request(app)
        .get('/api/students?groupBy=invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should maintain backward compatibility without groupBy parameter', async () => {
      // Test that normal flat list still works
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verify it's a flat list, not grouped
      const firstItem = response.body.data[0];
      expect(firstItem).toHaveProperty('_id');
      expect(firstItem).toHaveProperty('nom');
      expect(firstItem).not.toHaveProperty('students'); // Should not have 'students' array
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/students?groupBy=class')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
