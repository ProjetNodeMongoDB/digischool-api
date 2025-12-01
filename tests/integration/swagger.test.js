const request = require('supertest');
const app = require('../../src/app');
const swaggerSpec = require('../../src/config/swagger');

describe('Swagger Documentation API', () => {

  describe('GET /api-docs', () => {
    it('should redirect to /api-docs/ with trailing slash', async () => {
      const response = await request(app)
        .get('/api-docs')
        .expect(301);

      expect(response.headers.location).toBe('/api-docs/');
    });

    it('should return Swagger UI HTML page', async () => {
      const response = await request(app)
        .get('/api-docs/')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/text\/html/);
      expect(response.text).toContain('Swagger UI');
    });
  });

  describe('Swagger JSON Specification', () => {

    it('should return valid OpenAPI 3.0.0 specification', () => {
      expect(swaggerSpec).toHaveProperty('openapi', '3.0.0');
    });

    it('should have API info metadata', () => {
      expect(swaggerSpec.info).toBeDefined();
      expect(swaggerSpec.info.title).toBe('DigiSchool API');
      expect(swaggerSpec.info.version).toBe('1.0.0');
      expect(swaggerSpec.info.description).toBe('REST API for school management system');
    });

    it('should have server configuration', () => {
      expect(swaggerSpec.servers).toBeDefined();
      expect(swaggerSpec.servers.length).toBeGreaterThan(0);
      expect(swaggerSpec.servers[0].url).toBe('http://localhost:3000');
      expect(swaggerSpec.servers[0].description).toBe('Development server');
    });

    it('should have bearerAuth security scheme defined', () => {
      expect(swaggerSpec.components).toBeDefined();
      expect(swaggerSpec.components.securitySchemes).toBeDefined();
      expect(swaggerSpec.components.securitySchemes.bearerAuth).toBeDefined();
      expect(swaggerSpec.components.securitySchemes.bearerAuth.type).toBe('http');
      expect(swaggerSpec.components.securitySchemes.bearerAuth.scheme).toBe('bearer');
      expect(swaggerSpec.components.securitySchemes.bearerAuth.bearerFormat).toBe('JWT');
    });

    it('should have global security requirement for bearerAuth', () => {
      expect(swaggerSpec.security).toBeDefined();
      expect(swaggerSpec.security).toContainEqual({ bearerAuth: [] });
    });

    it('should have documented schemas for entities', () => {
      expect(swaggerSpec.components.schemas).toBeDefined();

      // Check that key schemas exist
      expect(swaggerSpec.components.schemas.Teacher).toBeDefined();
      expect(swaggerSpec.components.schemas.Student).toBeDefined();
      expect(swaggerSpec.components.schemas.Class).toBeDefined();
      expect(swaggerSpec.components.schemas.Subject).toBeDefined();
      expect(swaggerSpec.components.schemas.Trimester).toBeDefined();
      expect(swaggerSpec.components.schemas.User).toBeDefined();
      expect(swaggerSpec.components.schemas.AuthResponse).toBeDefined();
    });

    it('should have paths/endpoints documented', () => {
      expect(swaggerSpec.paths).toBeDefined();
      expect(Object.keys(swaggerSpec.paths).length).toBeGreaterThan(0);
    });

    describe('Authentication Endpoints Documentation', () => {
      it('should document POST /api/auth/register', () => {
        expect(swaggerSpec.paths['/api/auth/register']).toBeDefined();
        expect(swaggerSpec.paths['/api/auth/register'].post).toBeDefined();
        expect(swaggerSpec.paths['/api/auth/register'].post.summary).toBe('Register a new user');
        expect(swaggerSpec.paths['/api/auth/register'].post.tags).toContain('Authentication');
      });

      it('should document POST /api/auth/login', () => {
        expect(swaggerSpec.paths['/api/auth/login']).toBeDefined();
        expect(swaggerSpec.paths['/api/auth/login'].post).toBeDefined();
        expect(swaggerSpec.paths['/api/auth/login'].post.summary).toBe('Login user');
        expect(swaggerSpec.paths['/api/auth/login'].post.tags).toContain('Authentication');
      });

      it('should document POST /api/auth/logout as protected', () => {
        expect(swaggerSpec.paths['/api/auth/logout']).toBeDefined();
        expect(swaggerSpec.paths['/api/auth/logout'].post).toBeDefined();
        expect(swaggerSpec.paths['/api/auth/logout'].post.security).toBeDefined();
        expect(swaggerSpec.paths['/api/auth/logout'].post.security).toContainEqual({ bearerAuth: [] });
      });

      it('should document GET /api/auth/admin/users as admin-only', () => {
        expect(swaggerSpec.paths['/api/auth/admin/users']).toBeDefined();
        expect(swaggerSpec.paths['/api/auth/admin/users'].get).toBeDefined();
        expect(swaggerSpec.paths['/api/auth/admin/users'].get.security).toBeDefined();
        expect(swaggerSpec.paths['/api/auth/admin/users'].get.security).toContainEqual({ bearerAuth: [] });
      });

      it('should document PUT /api/auth/admin/users/{userId}/role', () => {
        expect(swaggerSpec.paths['/api/auth/admin/users/{userId}/role']).toBeDefined();
        expect(swaggerSpec.paths['/api/auth/admin/users/{userId}/role'].put).toBeDefined();
      });
    });

    describe('Teacher Endpoints Documentation', () => {
      it('should document GET /api/teachers', () => {
        expect(swaggerSpec.paths['/api/teachers']).toBeDefined();
        expect(swaggerSpec.paths['/api/teachers'].get).toBeDefined();
        expect(swaggerSpec.paths['/api/teachers'].get.tags).toContain('Teachers');
      });

      it('should document POST /api/teachers', () => {
        expect(swaggerSpec.paths['/api/teachers'].post).toBeDefined();
        expect(swaggerSpec.paths['/api/teachers'].post.summary).toBe('Create a new teacher');
      });

      it('should document GET /api/teachers/{id}', () => {
        expect(swaggerSpec.paths['/api/teachers/{id}']).toBeDefined();
        expect(swaggerSpec.paths['/api/teachers/{id}'].get).toBeDefined();
      });

      it('should document PUT /api/teachers/{id}', () => {
        expect(swaggerSpec.paths['/api/teachers/{id}'].put).toBeDefined();
      });

      it('should document DELETE /api/teachers/{id}', () => {
        expect(swaggerSpec.paths['/api/teachers/{id}'].delete).toBeDefined();
      });
    });

    describe('Student Endpoints Documentation', () => {
      it('should document GET /api/students', () => {
        expect(swaggerSpec.paths['/api/students']).toBeDefined();
        expect(swaggerSpec.paths['/api/students'].get).toBeDefined();
        expect(swaggerSpec.paths['/api/students'].get.tags).toContain('Students');
      });

      it('should document POST /api/students', () => {
        expect(swaggerSpec.paths['/api/students'].post).toBeDefined();
      });

      it('should document GET /api/students/{id}', () => {
        expect(swaggerSpec.paths['/api/students/{id}']).toBeDefined();
        expect(swaggerSpec.paths['/api/students/{id}'].get).toBeDefined();
      });

      it('should document PUT /api/students/{id}', () => {
        expect(swaggerSpec.paths['/api/students/{id}'].put).toBeDefined();
      });

      it('should document DELETE /api/students/{id}', () => {
        expect(swaggerSpec.paths['/api/students/{id}'].delete).toBeDefined();
      });
    });

    describe('Class Endpoints Documentation', () => {
      it('should document GET /api/classes', () => {
        expect(swaggerSpec.paths['/api/classes']).toBeDefined();
        expect(swaggerSpec.paths['/api/classes'].get).toBeDefined();
        expect(swaggerSpec.paths['/api/classes'].get.tags).toContain('Classes');
      });

      it('should document CRUD operations for classes', () => {
        expect(swaggerSpec.paths['/api/classes'].post).toBeDefined();
        expect(swaggerSpec.paths['/api/classes/{id}'].get).toBeDefined();
        expect(swaggerSpec.paths['/api/classes/{id}'].put).toBeDefined();
        expect(swaggerSpec.paths['/api/classes/{id}'].delete).toBeDefined();
      });
    });

    describe('Subject Endpoints Documentation', () => {
      it('should document GET /api/subjects', () => {
        expect(swaggerSpec.paths['/api/subjects']).toBeDefined();
        expect(swaggerSpec.paths['/api/subjects'].get).toBeDefined();
        expect(swaggerSpec.paths['/api/subjects'].get.tags).toContain('Subjects');
      });

      it('should document CRUD operations for subjects', () => {
        expect(swaggerSpec.paths['/api/subjects'].post).toBeDefined();
        expect(swaggerSpec.paths['/api/subjects/{id}'].get).toBeDefined();
        expect(swaggerSpec.paths['/api/subjects/{id}'].put).toBeDefined();
        expect(swaggerSpec.paths['/api/subjects/{id}'].delete).toBeDefined();
      });
    });

    describe('Trimester Endpoints Documentation', () => {
      it('should document GET /api/trimesters', () => {
        expect(swaggerSpec.paths['/api/trimesters']).toBeDefined();
        expect(swaggerSpec.paths['/api/trimesters'].get).toBeDefined();
        expect(swaggerSpec.paths['/api/trimesters'].get.tags).toContain('Trimesters');
      });

      it('should document CRUD operations for trimesters', () => {
        expect(swaggerSpec.paths['/api/trimesters'].post).toBeDefined();
        expect(swaggerSpec.paths['/api/trimesters/{id}'].get).toBeDefined();
        expect(swaggerSpec.paths['/api/trimesters/{id}'].put).toBeDefined();
        expect(swaggerSpec.paths['/api/trimesters/{id}'].delete).toBeDefined();
      });
    });

    describe('Response Schemas Validation', () => {
      it('Teacher schema should have required fields', () => {
        const teacherSchema = swaggerSpec.components.schemas.Teacher;
        expect(teacherSchema.required).toContain('nom');
        expect(teacherSchema.required).toContain('prenom');
        expect(teacherSchema.required).toContain('sexe');
        expect(teacherSchema.required).toContain('dateNaissance');
      });

      it('Student schema should have required fields', () => {
        const studentSchema = swaggerSpec.components.schemas.Student;
        expect(studentSchema.required).toContain('nom');
        expect(studentSchema.required).toContain('prenom');
        expect(studentSchema.required).toContain('sexe');
        expect(studentSchema.required).toContain('dateNaissance');
        expect(studentSchema.required).toContain('classe');
      });

      it('User schema should have required fields', () => {
        const userSchema = swaggerSpec.components.schemas.User;
        expect(userSchema.required).toContain('username');
        expect(userSchema.required).toContain('email');
        expect(userSchema.required).toContain('password');
      });
    });

    describe('API Tags Organization', () => {
      it('should have all entity tags defined', () => {
        const paths = swaggerSpec.paths;
        const allTags = new Set();

        // Extract all tags from paths
        Object.values(paths).forEach(pathItem => {
          Object.values(pathItem).forEach(operation => {
            if (operation.tags) {
              operation.tags.forEach(tag => allTags.add(tag));
            }
          });
        });

        expect(allTags.has('Authentication')).toBe(true);
        expect(allTags.has('Teachers')).toBe(true);
        expect(allTags.has('Students')).toBe(true);
        expect(allTags.has('Classes')).toBe(true);
        expect(allTags.has('Subjects')).toBe(true);
        expect(allTags.has('Trimesters')).toBe(true);
      });
    });
  });

  describe('Swagger UI Assets', () => {
    it('should serve swagger-ui CSS', async () => {
      const response = await request(app)
        .get('/api-docs/swagger-ui.css');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/css/);
    });

    it('should serve swagger-ui bundle JS', async () => {
      const response = await request(app)
        .get('/api-docs/swagger-ui-bundle.js');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/javascript/);
    });

    it('should serve swagger-ui standalone preset', async () => {
      const response = await request(app)
        .get('/api-docs/swagger-ui-standalone-preset.js');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/javascript/);
    });
  });
});
