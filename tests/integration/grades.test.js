const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Grade = require('../../src/models/Grade');
const Student = require('../../src/models/Student');
const Teacher = require('../../src/models/Teacher');
const Class = require('../../src/models/Class');
const Subject = require('../../src/models/Subject');
const Trimester = require('../../src/models/Trimester');
const connectDB = require('../../src/config/database');

describe('Grade API', () => {
	let studentId, classId, subjectId, teacherId, trimesterId;
	let student2Id, subject2Id;

	beforeAll(async () => {
		await connectDB();
	});

	beforeAll(async () => {
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
				.send(gradeData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should return 400 for missing required fields', async () => {
			const response = await request(app)
				.post('/api/grades')
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
				}
			]);
		});

		it('should return all grades', async () => {
			const response = await request(app)
				.get('/api/grades')
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(2);
		});

		it('should filter grades by student', async () => {
			const response = await request(app)
				.get('/api/grades?student=' + studentId)
				.expect(200);

			expect(response.body.count).toBe(1);
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
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.note).toBe(15);
		});

		it('should return 400 for invalid ID', async () => {
			const response = await request(app)
				.get('/api/grades/invalid-id')
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
				.expect(200);

			expect(response.body.success).toBe(true);
		});

		it('should return 400 for invalid ID', async () => {
			const response = await request(app)
				.delete('/api/grades/invalid-id')
				.expect(400);

			expect(response.body.success).toBe(false);
		});
	});
});
