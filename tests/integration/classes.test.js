const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Class = require('../../src/models/Class');
const Teacher = require('../../src/models/Teacher');
const User = require('../../src/models/User');

describe('Class API', () => {
	let teacherId;
	let authToken;

	beforeAll(async () => {
		// Create a user and get auth token for protected routes
		const registerResponse = await request(app)
			.post('/api/auth/register')
			.send({
				username: 'testuser',
				email: 'test@example.com',
				password: 'Test123456'
			});

		authToken = registerResponse.body.data.token;

		// Create a teacher once for all tests in this suite
		const teacher = await Teacher.create({
			nom: 'Dupont',
			prenom: 'Jean',
			dateNaissance: '1980-05-15',
			adresse: '123 Rue de Paris',
			sexe: 'HOMME',
		});
		teacherId = teacher._id;
	});

	beforeEach(async () => {
		// Only clean up classes, not teachers (to avoid interference)
		await Class.deleteMany({});
	});

	afterAll(async () => {
		// Clean up the teacher created for this test suite
		await Teacher.findByIdAndDelete(teacherId);
		await User.deleteMany({});
	});

	describe('POST /api/classes', () => {
		it('should create a new class', async () => {
			const classData = {
				nom: 'CM1',
				prof: teacherId.toString(),
			};

			const response = await request(app)
				.post('/api/classes')
				.send(classData)
				.expect('Content-Type', /json/)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('_id');
			expect(response.body.data.nom).toBe('CM1');
			expect(response.body.data.prof).toHaveProperty('_id');
			expect(response.body.data.prof.nom).toBe('Dupont');
			expect(response.body.data.prof.prenom).toBe('Jean');
		});

		it('should return 400 for missing required fields', async () => {
			const response = await request(app)
				.post('/api/classes')
				.send({})
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toBe('Validation failed');
		});

		it('should return 400 for missing class name', async () => {
			const classData = {
				prof: teacherId.toString(),
			};

			const response = await request(app)
				.post('/api/classes')
				.send(classData)
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toBe('Validation failed');
		});

		it('should return 400 for missing teacher', async () => {
			const classData = {
				nom: 'CM1',
			};

			const response = await request(app)
				.post('/api/classes')
				.send(classData)
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toBe('Validation failed');
		});

		it('should return 400 for invalid teacher ID format', async () => {
			const classData = {
				nom: 'CM1',
				prof: 'invalid-id',
			};

			const response = await request(app)
				.post('/api/classes')
				.send(classData)
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toBe('Validation failed');
		});

		it('should return 400 for class name exceeding max length', async () => {
			const classData = {
				nom: 'a'.repeat(101),
				prof: teacherId.toString(),
			};

			const response = await request(app)
				.post('/api/classes')
				.send(classData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should return error for duplicate class name', async () => {
			await Class.create({
				nom: 'CM1',
				prof: teacherId,
			});

			const classData = {
				nom: 'CM1',
				prof: teacherId.toString(),
			};

			const response = await request(app)
				.post('/api/classes')
				.send(classData);

			expect(response.body.success).toBe(false);
			expect([400, 500]).toContain(response.status);
		});

		it('should return error for non-existent teacher ID', async () => {
			const fakeTeacherId = new mongoose.Types.ObjectId();
			const classData = {
				nom: 'CM1',
				prof: fakeTeacherId.toString(),
			};

			const response = await request(app)
				.post('/api/classes')
				.send(classData);

			expect(response.body.success).toBe(false);
			expect([400, 500]).toContain(response.status);
		});
	});

	describe('GET /api/classes', () => {
		it('should get all classes', async () => {
			// Create a second teacher
			const teacher2 = await Teacher.create({
				nom: 'Martin',
				prenom: 'Marie',
				dateNaissance: '1985-03-20',
				sexe: 'FEMME',
			});

			await Class.create([
				{
					nom: 'CM1',
					prof: teacherId,
				},
				{
					nom: 'CM2',
					prof: teacher2._id,
				},
			]);

			const response = await request(app).get('/api/classes').expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(2);
			expect(response.body.data).toHaveLength(2);
			// Verify population works
			expect(response.body.data[0].prof).toHaveProperty('nom');
			expect(response.body.data[0].prof).toHaveProperty('prenom');
		});

		it('should return empty array when no classes exist', async () => {
			const response = await request(app).get('/api/classes').expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(0);
			expect(response.body.data).toHaveLength(0);
		});

		it('should return classes sorted alphabetically by name', async () => {
			await Class.create([
				{
					nom: 'CM2',
					prof: teacherId,
				},
				{
					nom: 'CM1',
					prof: teacherId,
				},
				{
					nom: 'CE2',
					prof: teacherId,
				},
			]);

			const response = await request(app).get('/api/classes').expect(200);

			expect(response.body.data[0].nom).toBe('CE2');
			expect(response.body.data[1].nom).toBe('CM1');
			expect(response.body.data[2].nom).toBe('CM2');
		});
	});

	describe('GET /api/classes/:id', () => {
		it('should get a class by ID', async () => {
			const classe = await Class.create({
				nom: 'CM1',
				prof: teacherId,
			});

			const response = await request(app)
				.get(`/api/classes/${classe._id}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.nom).toBe('CM1');
			// Verify population works
			expect(response.body.data.prof).toHaveProperty('nom');
			expect(response.body.data.prof).toHaveProperty('prenom');
			expect(response.body.data.prof.nom).toBe('Dupont');
		});

		it('should return 400 for invalid ID format', async () => {
			const response = await request(app)
				.get('/api/classes/invalid-id')
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should return 500 for non-existent ID', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.get(`/api/classes/${fakeId}`)
				.expect(500);

			expect(response.body.success).toBe(false);
		});
	});

	describe('PUT /api/classes/:id', () => {
		it('should update a class name', async () => {
			const classe = await Class.create({
				nom: 'CM1',
				prof: teacherId,
			});

			const updateData = {
				nom: 'CM2',
				prof: teacherId.toString(),
			};

			const response = await request(app)
				.put(`/api/classes/${classe._id}`)
				.send(updateData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.nom).toBe('CM2');
			// Verify population works
			expect(response.body.data.prof).toHaveProperty('nom');
		});

		it('should update a class teacher', async () => {
			const classe = await Class.create({
				nom: 'CM1',
				prof: teacherId,
			});

			// Create a new teacher
			const newTeacher = await Teacher.create({
				nom: 'Martin',
				prenom: 'Marie',
				dateNaissance: '1985-03-20',
				sexe: 'FEMME',
			});

			const updateData = {
				nom: 'CM1',
				prof: newTeacher._id.toString(),
			};

			const response = await request(app)
				.put(`/api/classes/${classe._id}`)
				.send(updateData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.prof.nom).toBe('Martin');
			expect(response.body.data.prof.prenom).toBe('Marie');
		});

		it('should return 400 for invalid ID format', async () => {
			const updateData = {
				nom: 'CM2',
				prof: teacherId.toString(),
			};

			const response = await request(app)
				.put('/api/classes/invalid-id')
				.send(updateData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should return 500 for non-existent ID', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const updateData = {
				nom: 'CM2',
				prof: teacherId.toString(),
			};

			const response = await request(app)
				.put(`/api/classes/${fakeId}`)
				.send(updateData)
				.expect(500);

			expect(response.body.success).toBe(false);
		});

		it('should return 400 for invalid update data', async () => {
			const classe = await Class.create({
				nom: 'CM1',
				prof: teacherId,
			});

			const updateData = {
				nom: '',
				prof: teacherId.toString(),
			};

			const response = await request(app)
				.put(`/api/classes/${classe._id}`)
				.send(updateData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should return 400 for invalid teacher ID in update', async () => {
			const classe = await Class.create({
				nom: 'CM1',
				prof: teacherId,
			});

			const updateData = {
				nom: 'CM1',
				prof: 'invalid-id',
			};

			const response = await request(app)
				.put(`/api/classes/${classe._id}`)
				.send(updateData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});
	});

	describe('DELETE /api/classes/:id', () => {
		it('should delete a class', async () => {
			const classe = await Class.create({
				nom: 'CM1',
				prof: teacherId,
			});

			const response = await request(app)
				.delete(`/api/classes/${classe._id}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe('Class deleted successfully');

			const deletedClass = await Class.findById(classe._id);
			expect(deletedClass).toBeNull();
		});

		it('should return 400 for invalid ID format', async () => {
			const response = await request(app)
				.delete('/api/classes/invalid-id')
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should return 500 for non-existent ID', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.delete(`/api/classes/${fakeId}`)
				.expect(500);

			expect(response.body.success).toBe(false);
		});
	});
});
