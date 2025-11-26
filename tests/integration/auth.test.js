const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');

describe('Authentication API', () => {
    afterAll(async () => {
        // Clean up after all auth tests are done
        await User.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
        const validUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Test123456'
            // Note: role is not allowed in registration, defaults to 'student'
        };

        beforeEach(async () => {
            // Clean users before each register test
            await User.deleteMany({});
        });

        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(validUser);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User registered successfully');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user.email).toBe(validUser.email);
            expect(response.body.data.user.username).toBe(validUser.username);
            expect(response.body.data.user.role).toBe('student'); // Default role
            expect(response.body.data.user).not.toHaveProperty('password');
        });

        it('should hash password before saving', async () => {
            await request(app)
                .post('/api/auth/register')
                .send(validUser);

            const user = await User.findOne({ email: validUser.email }).select('+password');
            expect(user.password).not.toBe(validUser.password);
            expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
        });

        it('should return valid JWT token', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(validUser);

            const token = response.body.data.token;
            expect(token).toBeDefined();

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            expect(decoded).toHaveProperty('userId');
            expect(decoded).toHaveProperty('email');
            expect(decoded.email).toBe(validUser.email);
        });

        it('should default to student role if not specified', async () => {
            const userWithoutRole = { ...validUser };
            delete userWithoutRole.role;

            const response = await request(app)
                .post('/api/auth/register')
                .send(userWithoutRole);

            expect(response.status).toBe(201);
            expect(response.body.data.user.role).toBe('student');
        });

        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...validUser,
                    email: 'invalid-email'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for weak password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...validUser,
                    password: '123' // Too short and weak
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 when role field is provided', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...validUser,
                    role: 'teacher' // Any role should be rejected
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should prevent duplicate email registration', async () => {
            // Register first user
            await request(app)
                .post('/api/auth/register')
                .send(validUser);

            // Try to register with same email
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...validUser,
                    username: 'different_username'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should prevent duplicate username registration', async () => {
            // Register first user
            await request(app)
                .post('/api/auth/register')
                .send(validUser);

            // Try to register with same username
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...validUser,
                    email: 'different@example.com'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        const validUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Test123456'
            // Note: role is not allowed in registration, defaults to 'student'
        };

        beforeEach(async () => {
            // Clean users and create a user for login tests
            await User.deleteMany({});
            await request(app)
                .post('/api/auth/register')
                .send(validUser);
        });

        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: validUser.email,
                    password: validUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user.email).toBe(validUser.email);
            expect(response.body.data.user).not.toHaveProperty('password');
        });

        it('should return 400 for missing email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    password: validUser.password
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for missing password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: validUser.email
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: validUser.password
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: validUser.email,
                    password: 'WrongPassword123'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/logout', () => {
        let authToken;

        beforeEach(async () => {
            // Clean users and create a user for logout tests
            await User.deleteMany({});
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'Test123456'
                    // Note: role is not allowed in registration, defaults to 'student'
                });

            authToken = registerResponse.body.data.token;
        });

        it('should logout successfully', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should require authentication', async () => {
            const response = await request(app)
                .post('/api/auth/logout');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

});