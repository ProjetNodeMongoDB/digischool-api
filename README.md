# DigiSchool Backend API

> REST API for school management with Node.js, Express.js, and MongoDB

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)

---

## Presentation du Projet

DigiSchool Backend API is a complete REST API for managing a school system with students, teachers, classes, subjects, grades, and trimesters.

**Key Features:**
- CRUD operations for 6 entities (Students, Teachers, Classes, Subjects, Grades, Trimesters)
- JWT authentication and role-based authorization (Admin, Teacher, Student)
- Input validation with express-validator
- Interactive Swagger documentation
- Docker containerization
- Security middleware (Helmet, CORS, Rate-limiting)
- Comprehensive testing with Jest

---

## Liste des Dependances

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.1.0 | Web framework |
| mongoose | ^8.20.0 | MongoDB ODM |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| bcryptjs | ^3.0.3 | Password hashing |
| express-validator | ^7.3.1 | Request validation |
| helmet | ^8.1.0 | Security headers |
| cors | ^2.8.5 | CORS support |
| express-rate-limit | ^8.2.1 | Rate limiting |
| swagger-ui-express | ^5.0.1 | API documentation |
| jest | ^30.2.0 | Testing framework |
| supertest | ^7.1.4 | HTTP testing |

Install all dependencies:
```bash
npm install
```

---

## Instructions pour Lancer l'API

### Prerequisites
- Node.js 20+ ([Download](https://nodejs.org/))
- MongoDB 7+ (local or Docker)

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd digischool-api

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (Docker)
docker run -d -p 27017:27017 --name mongodb mongo:7

# Start development server
npm run dev
```

API available at: `http://localhost:3000`

### Environment Variables (.env)

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/digischool
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Available Scripts

```bash
npm run dev              # Development with nodemon
npm start                # Production mode
npm test                 # Run tests
npm run test:coverage    # Test coverage report
npm run lint             # ESLint check
```

---

## Documentation Swagger

Interactive API documentation with Swagger UI:

```
http://localhost:3000/api-docs
```

**Features:**
- Complete endpoint documentation
- Try-it-out functionality for all endpoints
- Request/response schemas
- JWT authentication support (click "Authorize" button)

**Usage:**
1. Start the API: `npm run dev`
2. Open browser: `http://localhost:3000/api-docs`
3. Test endpoints directly from the UI

---

## Securite Basique

### Security Measures Implemented

1. **Helmet:** Secure HTTP headers (XSS, clickjacking protection)
2. **CORS:** Controlled cross-origin requests
3. **Rate Limiting:** 100 requests per 15 minutes per IP
4. **Input Validation:** express-validator on all endpoints
5. **Password Security:** bcrypt hashing (10 rounds)
6. **Environment Variables:** All secrets in .env (never committed)
7. **Error Handling:** No sensitive data exposed in responses

### JWT Authentication

All protected endpoints require:
```
Authorization: Bearer <your-jwt-token>
```

**Flow:**
1. Register: `POST /api/auth/register`
2. Login: `POST /api/auth/login` (returns JWT token)
3. Use token in Authorization header for protected routes

**Example:**
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token
curl -X GET http://localhost:3000/api/students \
  -H "Authorization: Bearer <your-token>"
```

### Role-Based Access Control (RBAC)

Three user roles with hierarchical permissions:

| Role | Permissions |
|------|-------------|
| **student** | Read access (GET endpoints) |
| **teacher** | Read + Create/Update grades and classes |
| **admin** | Full access (CRUD all resources + user management) |

**Admin-only endpoints:**
- `GET /api/auth/admin/users` - List all users
- `PUT /api/auth/admin/users/:userId/role` - Update user role
- `POST/PUT/DELETE` on Teachers, Students, Subjects, Trimesters

**Teacher/Admin endpoints:**
- `POST/PUT` on Grades and Classes

---

## Etapes Docker

### Docker Compose (Recommended)

Start API + MongoDB with one command:

```bash
# 1. Build and start containers
docker-compose up -d

# 2. Verify containers are running
docker ps

# Expected output:
# CONTAINER ID   IMAGE                STATUS             PORTS
# abc123...      digischool-api-api   Up (healthy)       0.0.0.0:3000->3000/tcp
# def456...      mongo:7              Up (healthy)       0.0.0.0:27017->27017/tcp
```

### Docker Architecture

The Docker setup includes:
- **API container:** Node.js 20 Alpine with production-optimized build
  - Container name: `digischool-api`
  - Port: `3000`
  - Health check: `/health` endpoint
  - Auto-restart: `unless-stopped`
- **MongoDB container:** MongoDB 7 with persistent storage
  - Container name: `digischool-mongodb`
  - Port: `27017`
  - Volume: `mongodb_data` (persistent storage)
  - Health check: `mongosh ping`
- **Network:** Custom bridge network `digischool-network`
- **Security:** API runs as non-root user, production dependencies only

---

### Access the Dockerized API

#### 1. Health Check
```bash
curl http://localhost:3000/health
# Response: {"status":"ok"}
```

#### 2. Swagger Documentation
Open in browser:
```
http://localhost:3000/api-docs
```

#### 3. API Endpoints (with Authentication)

**Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test12345"}'
```

**Response includes JWT token:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Access protected endpoints:**
```bash
# Use the token from registration/login
curl http://localhost:3000/api/teachers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Access the Docker MongoDB Database

#### Method 1: MongoDB Shell (from host machine)

```bash
# List all collections
docker exec digischool-mongodb mongosh digischool --quiet --eval "db.getCollectionNames()"

# View all teachers
docker exec digischool-mongodb mongosh digischool --quiet --eval "db.teachers.find().pretty()"

# View all users
docker exec digischool-mongodb mongosh digischool --quiet --eval "db.users.find().pretty()"

# Count documents
docker exec digischool-mongodb mongosh digischool --quiet --eval "db.teachers.countDocuments()"

# Database statistics
docker exec digischool-mongodb mongosh digischool --quiet --eval "db.stats()"
```

#### Method 2: Interactive MongoDB Shell (Windows)

```bash
# For Windows Git Bash/MINGW, use winpty:
winpty docker exec -it digischool-mongodb mongosh digischool

# Then run commands:
# > show collections
# > db.teachers.find()
# > db.users.countDocuments()
# > exit
```

#### Method 3: MongoDB Compass (GUI - Recommended)

1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Open Compass
3. Connect using: `mongodb://localhost:27017/digischool`
4. Browse all collections visually

---

### Docker Management Commands

#### View Logs

```bash
# Follow API logs
docker-compose logs -f api
# or
docker logs digischool-api -f

# Follow MongoDB logs
docker logs digischool-mongodb -f

# View last 50 lines
docker logs digischool-api --tail 50
```

#### Container Status

```bash
# Check container health
docker ps

# Detailed container info
docker inspect digischool-api

# Container resource usage
docker stats digischool-api digischool-mongodb
```

#### Stop and Start

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (deletes MongoDB data)
docker-compose down -v

# Start containers
docker-compose up -d

# Restart containers
docker-compose restart

# Rebuild and start (after code changes)
docker-compose up -d --build
```

**Services:**
- **API:** Node.js app on port 3000
- **MongoDB:** Database on port 27017
- **Network:** Bridge network `digischool-network`
- **Volume:** Persistent storage `mongodb_data`

### Dockerfile Only

```bash
# Build image
docker build -t digischool-api .

# Run container
docker run -d -p 3000:3000 \
  --env-file .env \
  --name digischool-api \
  digischool-api
```

### Docker Configuration

**Dockerfile features:**
- Multi-stage build (if needed)
- Non-root user (node:node)
- Production dependencies only
- Health check endpoint
- Alpine base image (smaller size)

**docker-compose.yml:**
- Service orchestration
- Automatic MongoDB setup
- Volume persistence
- Network isolation
- Container restart policies

---

## Authentification JWT

### JWT Implementation

**Token Structure:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "student",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Configuration:**
- Algorithm: HS256
- Secret: From JWT_SECRET environment variable
- Expiry: 7 days (configurable via JWT_EXPIRE)

### Authentication Flow

1. **Register User:**
```bash
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "student"
}
```

2. **Login:**
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

3. **Access Protected Endpoints:**
```bash
GET /api/students
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Middleware Protection

**authMiddleware.js:**
- `protect` - Verifies JWT token (all protected routes)
- `authorize(...roles)` - Checks user role permissions
- `optionalAuth` - Token optional (future feature)

**Usage in routes:**
```javascript
// Require authentication only
router.get('/students', protect, studentController.getAll);

// Require admin role
router.post('/students', protect, authorize('admin'), studentController.create);

// Require teacher or admin
router.post('/grades', protect, authorize('admin', 'teacher'), gradeController.create);
```

### Security Best Practices

- Passwords hashed with bcrypt before storage
- JWT tokens stored client-side (localStorage/sessionStorage)
- Tokens validated on every protected request
- Expired tokens automatically rejected
- No password fields returned in API responses
- Role changes require admin authentication

---

## API Endpoints Summary

**Total:** 36 endpoints

### Authentication (5 endpoints)
- `POST /api/auth/register` - Register new user (Public)
- `POST /api/auth/login` - Login and get JWT (Public)
- `GET /api/auth/me` - Get current user (Authenticated)
- `GET /api/auth/admin/users` - List all users (Admin)
- `PUT /api/auth/admin/users/:userId/role` - Update user role (Admin)

### Protected Resources (Require JWT + appropriate role)

| Resource | Endpoints | Permissions |
|----------|-----------|-------------|
| **Students** (5) | `GET /api/students`<br>`GET /api/students?classe=id`<br>`POST /api/students`<br>`GET /api/students/:id`<br>`PUT /api/students/:id`<br>`DELETE /api/students/:id` | GET: All<br>POST/PUT/DELETE: Admin |
| **Teachers** (5) | `GET /api/teachers`<br>`GET /api/teachers?classe=id`<br>`POST /api/teachers`<br>`GET /api/teachers/:id`<br>`PUT /api/teachers/:id`<br>`DELETE /api/teachers/:id` | GET: All<br>POST/PUT/DELETE: Admin |
| **Classes** (5) | `GET /api/classes`<br>`POST /api/classes`<br>`GET /api/classes/:id`<br>`PUT /api/classes/:id`<br>`DELETE /api/classes/:id` | GET: All<br>POST/PUT: Teacher/Admin<br>DELETE: Admin |
| **Subjects** (5) | `GET /api/subjects`<br>`POST /api/subjects`<br>`GET /api/subjects/:id`<br>`PUT /api/subjects/:id`<br>`DELETE /api/subjects/:id` | GET: All<br>POST/PUT/DELETE: Admin |
| **Trimesters** (5) | `GET /api/trimesters`<br>`POST /api/trimesters`<br>`GET /api/trimesters/:id`<br>`PUT /api/trimesters/:id`<br>`DELETE /api/trimesters/:id` | GET: All<br>POST/PUT/DELETE: Admin |
| **Grades** (6) | `GET /api/grades`<br>`GET /api/grades?student=id&class=id&subject=id&trimester=id&groupBy=subject`<br>`POST /api/grades`<br>`GET /api/grades/:id`<br>`PUT /api/grades/:id`<br>`DELETE /api/grades/:id`<br>`GET /api/grades/teachers/:teacherId/students-grades` | GET: All<br>POST/PUT: Teacher/Admin<br>DELETE: Admin |

### System (2 endpoints)
- `GET /health` - Health check (Public)
- `GET /api-docs` - Swagger UI (Public)

---

## Project Structure

```
digischool-api/
├── src/
│   ├── config/          # Database & Swagger config
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes with validation
│   ├── middlewares/     # Auth, validation, error handling
│   ├── app.js           # Express app setup
│   └── server.js        # Entry point
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # API tests
├── .env.example         # Environment template
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## Testing

```bash
# Run all tests
npm test

# Specific test file
npm test students.test.js

# Coverage report (target: 70%+)
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## Troubleshooting

**MongoDB connection failed:**
```bash
docker ps | grep mongo    # Check if running
docker start mongodb      # Start if stopped
```

**Port 3000 in use:**
```bash
lsof -i :3000            # Find process
kill -9 <PID>            # Kill process
```

**JWT token invalid:**
- Verify format: `Authorization: Bearer <token>`
- Check JWT_SECRET in .env
- Token may be expired (default: 7 days)

---

## License

Educational project for learning purposes.

**Built with care for 3 women developers**
