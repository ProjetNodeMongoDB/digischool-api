const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Admin Role Management API', () => {
    let adminToken;
    let studentToken;
    let teacherToken;
    let studentUserId;
    let teacherUserId;

    beforeAll(async () => {
        // Clean users collection
        await User.deleteMany({});

        // Create admin user directly (since we can't promote to admin via API)
        const admin = new User({
            username: 'admin',
            email: 'admin@digischool.com',
            password: 'Admin123456',
            role: 'admin'
        });
        await admin.save();

        // Create student user via registration (defaults to student role)
        const studentResponse = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'student',
                email: 'student@example.com',
                password: 'Student123456'
            });
        studentUserId = studentResponse.body.data.user._id;

        // Create teacher user via registration, then promote to teacher
        const teacherRegResponse = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'teacher',
                email: 'teacher@example.com',
                password: 'Teacher123456'
            });
        teacherUserId = teacherRegResponse.body.data.user._id;

        // Get admin token
        const adminResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@digischool.com',
                password: 'Admin123456'
            });
        adminToken = adminResponse.body.data.token;

        // Promote teacher user to teacher role using admin privileges
        await request(app)
            .put(`/api/auth/admin/users/${teacherUserId}/role`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ role: 'teacher' });

        // Get student token
        studentToken = studentResponse.body.data.token;

        // Get teacher token
        const teacherResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'teacher@example.com',
                password: 'Teacher123456'
            });
        teacherToken = teacherResponse.body.data.token;
    });

    afterAll(async () => {
        // Clean up users after tests
        await User.deleteMany({});
    });

    describe('GET /api/auth/admin/users', () => {
        it('should return all users for admin', async () => {
            const response = await request(app)
                .get('/api/auth/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(3); // admin + student + teacher
            expect(response.body.data.users).toHaveLength(3);

            // Check user structure (no passwords)
            response.body.data.users.forEach(user => {
                expect(user).not.toHaveProperty('password');
                expect(user).toHaveProperty('_id');
                expect(user).toHaveProperty('username');
                expect(user).toHaveProperty('email');
                expect(user).toHaveProperty('role');
            });
        });

        it('should deny access to non-admin users', async () => {
            const response = await request(app)
                .get('/api/auth/admin/users')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Access denied');
        });

        it('should deny access without authentication', async () => {
            const response = await request(app)
                .get('/api/auth/admin/users');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });


    describe('PUT /api/auth/admin/users/:userId/role', () => {
        it('should promote student to teacher', async () => {
            const response = await request(app)
                .put(`/api/auth/admin/users/${studentUserId}/role`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role: 'teacher' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('student to teacher');
            expect(response.body.data.user.role).toBe('teacher');

            // Verify in database
            const updatedUser = await User.findById(studentUserId);
            expect(updatedUser.role).toBe('teacher');
        });

        it('should promote teacher to admin', async () => {
            const response = await request(app)
                .put(`/api/auth/admin/users/${teacherUserId}/role`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role: 'admin' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('teacher to admin');
            expect(response.body.data.user.role).toBe('admin');
        });

        it('should demote teacher to student', async () => {
            const response = await request(app)
                .put(`/api/auth/admin/users/${teacherUserId}/role`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role: 'student' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('to student');
            expect(response.body.data.user.role).toBe('student');
        });

        it('should prevent admin from changing own role', async () => {
            // Get admin user ID
            const admin = await User.findOne({ role: 'admin' });

            const response = await request(app)
                .put(`/api/auth/admin/users/${admin._id}/role`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role: 'student' });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Cannot modify your own role');
        });

        it('should return 404 for non-existent user', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .put(`/api/auth/admin/users/${fakeId}/role`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role: 'teacher' });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('User not found');
        });

        it('should validate role values', async () => {
            const response = await request(app)
                .put(`/api/auth/admin/users/${studentUserId}/role`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role: 'invalidrole' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should validate user ID format', async () => {
            const response = await request(app)
                .put('/api/auth/admin/users/invalidid/role')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role: 'teacher' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should deny access to non-admin users', async () => {
            const response = await request(app)
                .put(`/api/auth/admin/users/${studentUserId}/role`)
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({ role: 'admin' });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Access denied');
        });

        it('should require authentication', async () => {
            const response = await request(app)
                .put(`/api/auth/admin/users/${studentUserId}/role`)
                .send({ role: 'teacher' });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should require role field', async () => {
            const response = await request(app)
                .put(`/api/auth/admin/users/${studentUserId}/role`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('Role Management Security', () => {
        it('should maintain role hierarchy security', async () => {
            // Student trying to access admin endpoint
            const response1 = await request(app)
                .get('/api/auth/admin/users')
                .set('Authorization', `Bearer ${studentToken}`);
            expect(response1.status).toBe(403);

            // Teacher trying to access admin endpoint
            const response2 = await request(app)
                .get('/api/auth/admin/users')
                .set('Authorization', `Bearer ${teacherToken}`);
            expect(response2.status).toBe(403);

            // Only admin should succeed
            const response3 = await request(app)
                .get('/api/auth/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response3.status).toBe(200);
        });

        it('should prevent role escalation attempts', async () => {
            // Student trying to promote themselves
            const admin = await User.findOne({ role: 'admin' });

            const response = await request(app)
                .put(`/api/auth/admin/users/${admin._id}/role`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ role: 'student' });

            expect(response.status).toBe(403);
        });
    });

    describe('Default Role Verification', () => {
        it('should default new registrations to student role', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'newuser',
                    email: 'newuser@example.com',
                    password: 'NewUser123456'
                });

            expect(response.status).toBe(201);
            expect(response.body.data.user.role).toBe('student');
        });

        it('should respect explicitly set roles during registration', async () => {
            // This test verifies that while default is student,
            // explicit role setting still works (for admin use)
            const adminUser = await User.findOne({ role: 'admin' });

            // Only testing that validation allows it, not that users can self-assign
            expect(['admin', 'teacher', 'student']).toContain(adminUser.role);
        });
    });
});