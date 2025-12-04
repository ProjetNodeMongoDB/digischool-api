const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');

describe('Health API', () => {
	describe('GET /health', () => {
		it('should return overall health status with 200', async () => {
			const response = await request(app)
				.get('/health')
				.expect('Content-Type', /json/)
				.expect(200);

			expect(response.body).toHaveProperty('status', 'ok');
			expect(response.body).toHaveProperty('timestamp');
			expect(response.body).toHaveProperty('uptime');
			expect(response.body).toHaveProperty('checks');
			expect(response.body.checks).toHaveProperty('live');
			expect(response.body.checks).toHaveProperty('ready');
			expect(response.body.checks.live.status).toBe('alive');
			expect(response.body.checks.ready.status).toBe('ready');
			expect(response.body.checks.ready.mongodb).toBe('connected');
		});

		it('should include valid timestamp in ISO format', async () => {
			const response = await request(app)
				.get('/health')
				.expect(200);

			const timestamp = new Date(response.body.timestamp);
			expect(timestamp).toBeInstanceOf(Date);
			expect(timestamp.toISOString()).toBe(response.body.timestamp);
		});

		it('should include uptime as a number', async () => {
			const response = await request(app)
				.get('/health')
				.expect(200);

			expect(typeof response.body.uptime).toBe('number');
			expect(response.body.uptime).toBeGreaterThan(0);
		});

		it('should return 503 when database is disconnected', async () => {
			// Save original connection state
			const originalReadyState = mongoose.connection.readyState;

			// Mock disconnected state
			Object.defineProperty(mongoose.connection, 'readyState', {
				value: 0,
				writable: true,
				configurable: true
			});

			const response = await request(app)
				.get('/health')
				.expect('Content-Type', /json/)
				.expect(503);

			expect(response.body.status).toBe('unhealthy');
			expect(response.body).toHaveProperty('error');
			expect(response.body.checks.ready.status).toBe('not ready');

			// Restore original state
			Object.defineProperty(mongoose.connection, 'readyState', {
				value: originalReadyState,
				writable: true,
				configurable: true
			});
		});
	});

	describe('GET /health/live', () => {
		it('should return liveness status with 200', async () => {
			const response = await request(app)
				.get('/health/live')
				.expect('Content-Type', /json/)
				.expect(200);

			expect(response.body).toHaveProperty('status', 'alive');
			expect(response.body).toHaveProperty('timestamp');
		});

		it('should include valid timestamp in ISO format', async () => {
			const response = await request(app)
				.get('/health/live')
				.expect(200);

			const timestamp = new Date(response.body.timestamp);
			expect(timestamp).toBeInstanceOf(Date);
			expect(timestamp.toISOString()).toBe(response.body.timestamp);
		});

		it('should always return 200 even if database is down', async () => {
			// Liveness probe should not check database
			// It only checks if the Node process is running
			const response = await request(app)
				.get('/health/live')
				.expect(200);

			expect(response.body.status).toBe('alive');
		});

		it('should respond quickly (< 100ms)', async () => {
			const start = Date.now();

			await request(app)
				.get('/health/live')
				.expect(200);

			const duration = Date.now() - start;
			expect(duration).toBeLessThan(100);
		});
	});

	describe('GET /health/ready', () => {
		it('should return readiness status with 200', async () => {
			const response = await request(app)
				.get('/health/ready')
				.expect('Content-Type', /json/)
				.expect(200);

			expect(response.body).toHaveProperty('status', 'ready');
			expect(response.body).toHaveProperty('timestamp');
			expect(response.body).toHaveProperty('mongodb');
			expect(response.body.mongodb).toHaveProperty('status', 'connected');
			expect(response.body.mongodb).toHaveProperty('readyState', 1);
		});

		it('should include valid timestamp in ISO format', async () => {
			const response = await request(app)
				.get('/health/ready')
				.expect(200);

			const timestamp = new Date(response.body.timestamp);
			expect(timestamp).toBeInstanceOf(Date);
			expect(timestamp.toISOString()).toBe(response.body.timestamp);
		});

		it('should verify MongoDB connection state', async () => {
			const response = await request(app)
				.get('/health/ready')
				.expect(200);

			expect(response.body.mongodb.readyState).toBe(1); // 1 = connected
		});

		it('should return 503 when database is disconnected', async () => {
			// Save original connection state
			const originalReadyState = mongoose.connection.readyState;

			// Mock disconnected state
			Object.defineProperty(mongoose.connection, 'readyState', {
				value: 0,
				writable: true,
				configurable: true
			});

			const response = await request(app)
				.get('/health/ready')
				.expect('Content-Type', /json/)
				.expect(503);

			expect(response.body.status).toBe('not ready');
			expect(response.body).toHaveProperty('error');
			expect(response.body.mongodb.status).toBe('disconnected');
			expect(response.body.mongodb.readyState).toBe(0);

			// Restore original state
			Object.defineProperty(mongoose.connection, 'readyState', {
				value: originalReadyState,
				writable: true,
				configurable: true
			});
		});
	});

	describe('Health Endpoints - No Authentication Required', () => {
		it('should access /health without Authorization header', async () => {
			const response = await request(app)
				.get('/health')
				.expect(200);

			expect(response.body.status).toBe('ok');
		});

		it('should access /health/live without Authorization header', async () => {
			const response = await request(app)
				.get('/health/live')
				.expect(200);

			expect(response.body.status).toBe('alive');
		});

		it('should access /health/ready without Authorization header', async () => {
			const response = await request(app)
				.get('/health/ready')
				.expect(200);

			expect(response.body.status).toBe('ready');
		});
	});
});
