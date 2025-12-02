const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Grade = require('../../src/models/Grade');
const Student = require('../../src/models/Student');
const Teacher = require('../../src/models/Teacher');
const Class = require('../../src/models/Class');
const Subject = require('../../src/models/Subject');
const Trimester = require('../../src/models/Trimester');
const User = require('../../src/models/User');
const connectDB = require('../../src/config/database');

describe('Grade API', () => {
	let studentId, classId, subjectId, teacherId, trimesterId;
	let student2Id, subject2Id, class2Id, trimester2Id;
	let authToken;
	let userId;

	beforeAll(async () => {
		// Create a user and get auth token for protected routes
		const registerResponse = await request(app)
			.post('/api/auth/register')
			.send({
				username: 'grade-test-teacher',
				email: 'grade-tests@example.com',
				password: 'Test123456'
			});

		userId = registerResponse.body.data.user._id;
		authToken = registerResponse.body.data.token;

		// Update user role to admin for testing CRUD operations (DELETE requires admin)
		const User = require('../../src/models/User');
		await User.findByIdAndUpdate(userId, { role: 'admin' });

		const teacher = await Teacher.create({
			nom: 'Dupont',
			prenom: 'Jean',
			dateNaissance: '1980-05-15',
			adresse: '123 Rue de Paris',
			sexe: 'HOMME',
		});
		teacherId = teacher._id;

		const classe = await Class.create({
			nom: 'CM1',
			prof: teacherId,
		});
		classId = classe._id;

		const subject = await Subject.create({
			nom: 'Mathematics'
		});
		subjectId = subject._id;

		const subject2 = await Subject.create({
			nom: 'French'
		});
		subject2Id = subject2._id;

		const trimester = await Trimester.create({
			nom: 'Trim 1',
			date: new Date('2024-09-01')
		});
		trimesterId = trimester._id;

		const trimester2 = await Trimester.create({
			nom: 'Trim 2',
			date: new Date('2025-01-01')
		});
		trimester2Id = trimester2._id;

		const classe2 = await Class.create({
			nom: 'CM2',
			prof: teacherId,
		});
		class2Id = classe2._id;

		const student = await Student.create({
			nom: 'Martin',
			prenom: 'Sophie',
			classe: classId,
			dateNaissance: '2015-05-20',
			sexe: 'FEMME',
		});
		studentId = student._id;

		const student2 = await Student.create({
			nom: 'Duplessis',
			prenom: 'Pierre',
			classe: classId,
			dateNaissance: '2015-08-15',
			sexe: 'HOMME',
		});
		student2Id = student2._id;
	});

	beforeEach(async () => {
		await Grade.deleteMany({});
	});

	afterAll(async () => {
		await Grade.deleteMany({});
		await Student.deleteMany({});
		await Teacher.deleteMany({});
		await Class.deleteMany({});
		await Subject.deleteMany({});
		await Trimester.deleteMany({});
		await User.deleteMany({});
		await mongoose.connection.close();
	});

	describe('POST /api/grades', () => {
		it('should create a new grade with valid data', async () => {
			const gradeData = {
				ideleve: studentId.toString(),
				idclasse: classId.toString(),
				idmatiere: subjectId.toString(),
				idprof: teacherId.toString(),
				idtrimestre: trimesterId.toString(),
				note: 15,
				coefficient: 2
			};

			const response = await request(app)
				.post('/api/grades')
				.set('Authorization', `Bearer ${authToken}`)
				.send(gradeData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('_id');
			expect(response.body.data.note).toBe(15);
			expect(response.body.data.coefficient).toBe(2);
		});

		it('should return 400 for note > 20', async () => {
			const gradeData = {
				ideleve: studentId.toString(),
				idclasse: classId.toString(),
				idmatiere: subjectId.toString(),
				idprof: teacherId.toString(),
				idtrimestre: trimesterId.toString(),
				note: 25,
				coefficient: 2
			};

			const response = await request(app)
				.post('/api/grades')
				.set('Authorization', `Bearer ${authToken}`)
				.send(gradeData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should return 400 for missing required fields', async () => {
			const response = await request(app)
				.post('/api/grades')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ note: 15 })
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should return 400 for invalid ObjectId', async () => {
			const gradeData = {
				ideleve: 'invalid-id',
				idclasse: classId.toString(),
				idmatiere: subjectId.toString(),
				idprof: teacherId.toString(),
				idtrimestre: trimesterId.toString(),
				note: 15,
				coefficient: 2
			};

			const response = await request(app)
				.post('/api/grades')
				.set('Authorization', `Bearer ${authToken}`)
				.send(gradeData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});
	});

	describe('GET /api/grades', () => {
		beforeEach(async () => {
			await Grade.create([
				{
					ideleve: studentId,
					idclasse: classId,
					idmatiere: subjectId,
					idprof: teacherId,
					idtrimestre: trimesterId,
					note: 15,
					coefficient: 2
				},
				{
					ideleve: student2Id,
					idclasse: classId,
					idmatiere: subjectId,
					idprof: teacherId,
					idtrimestre: trimesterId,
					note: 12,
					coefficient: 2
				},
				{
					ideleve: studentId,
					idclasse: classId,
					idmatiere: subject2Id,
					idprof: teacherId,
					idtrimestre: trimesterId,
					note: 14,
					coefficient: 1
				},
				{
					ideleve: studentId,
					idclasse: class2Id,
					idmatiere: subjectId,
					idprof: teacherId,
					idtrimestre: trimesterId,
					note: 16,
					coefficient: 2
				},
				{
					ideleve: studentId,
					idclasse: classId,
					idmatiere: subjectId,
					idprof: teacherId,
					idtrimestre: trimester2Id,
					note: 18,
					coefficient: 2
				}
			]);
		});

		it('should return all grades', async () => {
			const response = await request(app)
				.get('/api/grades')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(5);
		});

		it('should filter grades by student', async () => {
			const response = await request(app)
				.get('/api/grades?student=' + studentId)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(4);
		});

		it('should filter grades by subject', async () => {
			const response = await request(app)
				.get('/api/grades?subject=' + subjectId)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(4);
		});

		it('should filter grades by class', async () => {
			const response = await request(app)
				.get('/api/grades?class=' + classId)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(4);
		});

		it('should filter grades by trimester', async () => {
			const response = await request(app)
				.get('/api/grades?trimester=' + trimesterId)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(4);
		});
	});

	describe('GET /api/grades?groupBy=subject', () => {
		beforeEach(async () => {
			// Create test data for grouped tests
			await Grade.create([
				{
					ideleve: studentId,
					idclasse: classId,
					idmatiere: subjectId, // Mathematics
					idprof: teacherId,
					idtrimestre: trimesterId,
					note: 15,
					coefficient: 2
				},
				{
					ideleve: student2Id,
					idclasse: classId,
					idmatiere: subjectId, // Mathematics
					idprof: teacherId,
					idtrimestre: trimesterId,
					note: 12,
					coefficient: 2
				},
				{
					ideleve: studentId,
					idclasse: classId,
					idmatiere: subject2Id, // French
					idprof: teacherId,
					idtrimestre: trimesterId,
					note: 14,
					coefficient: 1
				},
				{
					ideleve: studentId,
					idclasse: class2Id,
					idmatiere: subjectId, // Mathematics, different class
					idprof: teacherId,
					idtrimestre: trimesterId,
					note: 16,
					coefficient: 2
				},
				{
					ideleve: studentId,
					idclasse: classId,
					idmatiere: subjectId, // Mathematics, different trimester
					idprof: teacherId,
					idtrimestre: trimester2Id,
					note: 18,
					coefficient: 2
				}
			]);
		});

		it('should return grades grouped by subject', async () => {
			const response = await request(app)
				.get('/api/grades?groupBy=subject')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(2); // 2 subjects: Mathematics and French
			expect(Array.isArray(response.body.data)).toBe(true);

			// Verify structure of grouped response
			const firstSubject = response.body.data[0];
			expect(firstSubject).toHaveProperty('subject');
			expect(firstSubject.subject).toHaveProperty('_id');
			expect(firstSubject.subject).toHaveProperty('nom');
			expect(firstSubject).toHaveProperty('grades');
			expect(Array.isArray(firstSubject.grades)).toBe(true);

			// Verify grade structure
			const firstGrade = firstSubject.grades[0];
			expect(firstGrade).toHaveProperty('student');
			expect(firstGrade.student).toHaveProperty('nom');
			expect(firstGrade.student).toHaveProperty('prenom');
			expect(firstGrade).toHaveProperty('note');
			expect(firstGrade).toHaveProperty('coefficient');
			expect(firstGrade).toHaveProperty('teacher');
			expect(firstGrade.teacher).toHaveProperty('nom');
			expect(firstGrade.teacher).toHaveProperty('prenom');
		});

		it('should filter grouped grades by trimester', async () => {
			const response = await request(app)
				.get(`/api/grades?groupBy=subject&trimester=${trimesterId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(2); // 2 subjects in trimester 1

			// Count total grades across all subjects
			const totalGrades = response.body.data.reduce((sum, subject) => sum + subject.grades.length, 0);
			expect(totalGrades).toBe(4); // 4 grades in trimester 1
		});

		it('should filter grouped grades by class', async () => {
			const response = await request(app)
				.get(`/api/grades?groupBy=subject&class=${classId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(2); // 2 subjects in class CM1

			// Count total grades across all subjects
			const totalGrades = response.body.data.reduce((sum, subject) => sum + subject.grades.length, 0);
			expect(totalGrades).toBe(4); // 4 grades in class CM1
		});

		it('should filter grouped grades by both trimester and class', async () => {
			const response = await request(app)
				.get(`/api/grades?groupBy=subject&trimester=${trimesterId}&class=${classId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(2); // 2 subjects

			// Count total grades
			const totalGrades = response.body.data.reduce((sum, subject) => sum + subject.grades.length, 0);
			expect(totalGrades).toBe(3); // 3 grades matching both filters
		});

		it('should return empty array when no grades match filters', async () => {
			// Use a non-existent ObjectId
			const nonExistentId = new mongoose.Types.ObjectId();

			const response = await request(app)
				.get(`/api/grades?groupBy=subject&trimester=${nonExistentId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(0);
			expect(response.body.data).toEqual([]);
		});

		it('should return 400 for invalid groupBy value', async () => {
			const response = await request(app)
				.get('/api/grades?groupBy=invalid')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should maintain backward compatibility without groupBy parameter', async () => {
			// Test that normal flat list still works
			const response = await request(app)
				.get('/api/grades')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(5);
			expect(Array.isArray(response.body.data)).toBe(true);

			// Verify it's a flat list, not grouped
			const firstItem = response.body.data[0];
			expect(firstItem).toHaveProperty('_id');
			expect(firstItem).toHaveProperty('note');
			expect(firstItem).not.toHaveProperty('grades'); // Should not have 'grades' array
		});
	});

	describe('GET /api/grades/:id', () => {
		it('should get a grade by ID', async () => {
			const grade = await Grade.create({
				ideleve: studentId,
				idclasse: classId,
				idmatiere: subjectId,
				idprof: teacherId,
				idtrimestre: trimesterId,
				note: 15,
				coefficient: 2
			});

			const response = await request(app)
				.get('/api/grades/' + grade._id)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.note).toBe(15);
		});

		it('should return 400 for invalid ID', async () => {
			const response = await request(app)
				.get('/api/grades/invalid-id')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400);

			expect(response.body.success).toBe(false);
		});
	});

	describe('PUT /api/grades/:id', () => {
		it('should update a grade', async () => {
			const grade = await Grade.create({
				ideleve: studentId,
				idclasse: classId,
				idmatiere: subjectId,
				idprof: teacherId,
				idtrimestre: trimesterId,
				note: 15,
				coefficient: 2
			});

			const updateData = {
				ideleve: studentId.toString(),
				idclasse: classId.toString(),
				idmatiere: subjectId.toString(),
				idprof: teacherId.toString(),
				idtrimestre: trimesterId.toString(),
				note: 18,
				coefficient: 3
			};

			const response = await request(app)
				.put('/api/grades/' + grade._id)
				.set('Authorization', `Bearer ${authToken}`)
				.send(updateData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.note).toBe(18);
		});
	});

	describe('DELETE /api/grades/:id', () => {
		it('should delete a grade', async () => {
			const grade = await Grade.create({
				ideleve: studentId,
				idclasse: classId,
				idmatiere: subjectId,
				idprof: teacherId,
				idtrimestre: trimesterId,
				note: 15,
				coefficient: 2
			});

			const response = await request(app)
				.delete('/api/grades/' + grade._id)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
		});

		it('should return 400 for invalid ID', async () => {
			const response = await request(app)
				.delete('/api/grades/invalid-id')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400);

			expect(response.body.success).toBe(false);
		});
	});
});
