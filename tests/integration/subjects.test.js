const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Subject = require('../../src/models/Subject');
const User = require('../../src/models/User');

describe('Subject API', () => {
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
	});

	afterAll(async () => {
		// Clean up after tests
		await Subject.deleteMany({});
		await User.deleteMany({});
	});

	beforeEach(async () => {
		await Subject.deleteMany({});
	});

	describe('POST /api/subjects', () => {
		it('should create a new subject', async () => {
			const subjectData = {
				nom: 'Mathematics',
			};

			const response = await request(app)
				.post('/api/subjects').set("Authorization", `Bearer ${authToken}`)
				.set('Authorization', `Bearer ${authToken}`)
				.send(subjectData)
				.expect('Content-Type', /json/)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('_id');
			expect(response.body.data.nom).toBe('Mathematics');
		});

		it('should return 400 for missing required fields', async () => {
			const response = await request(app)
				.post('/api/subjects').set("Authorization", `Bearer ${authToken}`)
				.send({})
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toBe('Validation failed');
		});

		it('should return error for duplicate subject name', async () => {
			await Subject.create({ nom: 'Mathematics' });

			const subjectData = {
				nom: 'Mathematics',
			};

			const response = await request(app)
				.post('/api/subjects').set("Authorization", `Bearer ${authToken}`)
				.send(subjectData);

			expect(response.body.success).toBe(false);
			expect([400, 500]).toContain(response.status);
		});

		it('should return 400 for subject name exceeding max length', async () => {
			const subjectData = {
				nom: 'a'.repeat(251),
			};

			const response = await request(app)
				.post('/api/subjects').set("Authorization", `Bearer ${authToken}`)
				.send(subjectData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});
	});

	describe('GET /api/subjects', () => {
		it('should get all subjects', async () => {
			await Subject.create([
				{ nom: 'Mathematics' },
				{ nom: 'Physics' },
				{ nom: 'Chemistry' },
			]);

			const response = await request(app).get('/api/subjects').set("Authorization", `Bearer ${authToken}`).expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(3);
			expect(response.body.data).toHaveLength(3);
		});

		it('should return empty array when no subjects exist', async () => {
			const response = await request(app).get('/api/subjects').set("Authorization", `Bearer ${authToken}`).expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(0);
			expect(response.body.data).toHaveLength(0);
		});

		it('should return subjects sorted alphabetically by name', async () => {
			await Subject.create([
				{ nom: 'Physics' },
				{ nom: 'Chemistry' },
				{ nom: 'Biology' },
			]);

			const response = await request(app).get('/api/subjects').set("Authorization", `Bearer ${authToken}`).expect(200);

			expect(response.body.data[0].nom).toBe('Biology');
			expect(response.body.data[1].nom).toBe('Chemistry');
			expect(response.body.data[2].nom).toBe('Physics');
		});
	});

	describe('GET /api/subjects/:id', () => {
		it('should get a subject by ID', async () => {
			const subject = await Subject.create({
				nom: 'Mathematics',
			});

			const response = await request(app)
				.get(`/api/subjects/${subject._id}`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.nom).toBe('Mathematics');
		});

		it('should return 400 for invalid ID format', async () => {
			const response = await request(app)
				.get('/api/subjects/invalid-id')
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should return 500 for non-existent ID', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.get(`/api/subjects/${fakeId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.expect(500);
		});
	});

	describe('PUT /api/subjects/:id', () => {
		it('should update a subject', async () => {
			const subject = await Subject.create({
				nom: 'Mathematics',
			});

			const updateData = {
				nom: 'Advanced Mathematics',
			};

			const response = await request(app)
				.put(`/api/subjects/${subject._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.send(updateData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.nom).toBe('Advanced Mathematics');
		});

		it('should return 400 for invalid ID format', async () => {
			const updateData = {
				nom: 'Physics',
			};

			const response = await request(app)
				.put('/api/subjects/invalid-id')
				.set("Authorization", `Bearer ${authToken}`)
				.send(updateData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should return 500 for non-existent ID', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const updateData = {
				nom: 'Physics',
			};

			const response = await request(app)
				.put(`/api/subjects/${fakeId}`)
				.set("Authorization", `Bearer ${authToken}`)
				.send(updateData)
				.expect(500);
		});

		it('should return 400 for invalid data', async () => {
			const subject = await Subject.create({
				nom: 'Mathematics',
			});

			const updateData = {
				nom: '',
			};

			const response = await request(app)
				.put(`/api/subjects/${subject._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.send(updateData)
				.expect(400);

			expect(response.body.success).toBe(false);
		});
	});

	describe('DELETE /api/subjects/:id', () => {
		it('should delete a subject', async () => {
			const subject = await Subject.create({
				nom: 'Mathematics',
			});

			const response = await request(app)
				.delete(`/api/subjects/${subject._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe('Subject deleted successfully');

			const deletedSubject = await Subject.findById(subject._id);
			expect(deletedSubject).toBeNull();
		});

		it('should return 400 for invalid ID format', async () => {
			const response = await request(app)
				.delete('/api/subjects/invalid-id')
				.set("Authorization", `Bearer ${authToken}`)
				.expect(400);

			expect(response.body.success).toBe(false);
		});

		it('should return 500 for non-existent ID', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.delete(`/api/subjects/${fakeId}`)
				.set("Authorization", `Bearer ${authToken}`)
				.expect(500);
		});
	});
});
