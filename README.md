# DigiSchool Backend API

> A complete REST API for school management built with Node.js, Express.js, and MongoDB

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-Educational-yellow.svg)]()

---

## Project Overview

DigiSchool Backend API is a production-ready REST API for managing a school system, including students, teachers, classes, subjects, grades, and academic trimesters. This project converts an existing SQL database schema to MongoDB and implements modern backend best practices.

**Key Features:**
- Complete CRUD operations for 6 entities
- JWT authentication and authorization
- Input validation and error handling
- Interactive Swagger documentation
- Comprehensive testing (Jest + Supertest)
- Docker containerization
- Security middleware (Helmet, CORS, Rate-limiting)

---

## Quick Start

### Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- MongoDB 7+ (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Docker Desktop (optional, for containerization)
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd digital-school-nodejs

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if using local)
mongod
# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:7

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

### Verify Installation

```bash
# Health check
curl http://localhost:3000/health

# Expected response:
# {"status":"OK","message":"DigiSchool API is running","timestamp":"..."}
```

---

## Project Structure

```
digischool-api/
├── src/
│   ├── config/          # Database, Swagger configuration
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middlewares/     # Auth, validation, error handling
│   ├── utils/           # Helper functions
│   ├── app.js           # Express app setup
│   └── server.js        # Entry point
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # API endpoint tests
├── .env.example         # Environment template
├── package.json
├── Dockerfile
└── docker-compose.yml
```

---

## API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Protected Endpoints (Require JWT)

All endpoints require `Authorization: Bearer <token>` header.

| Resource | Endpoints |
|----------|-----------|
| **Students** | `GET, POST /api/students` <br> `GET, PUT, DELETE /api/students/:id` |
| **Teachers** | `GET, POST /api/teachers` <br> `GET, PUT, DELETE /api/teachers/:id` |
| **Classes** | `GET, POST /api/classes` <br> `GET, PUT, DELETE /api/classes/:id` |
| **Subjects** | `GET, POST /api/subjects` <br> `GET, PUT, DELETE /api/subjects/:id` |
| **Trimesters** | `GET, POST /api/trimesters` <br> `GET, PUT, DELETE /api/trimesters/:id` |
| **Grades** | `GET, POST /api/grades` <br> `GET, PUT, DELETE /api/grades/:id` <br> `GET /api/grades/student/:id` <br> `GET /api/grades/class/:id` <br> `GET /api/grades/trimester/:id` |

### System Endpoints (Public)
- `GET /health` - Health check
- `GET /api-docs` - Interactive Swagger documentation

**Total:** 40+ endpoints

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/digischool
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/digischool

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=*
```

**Important:** Never commit the `.env` file. Use `.env.example` as a template.

---

## Available Scripts

```bash
# Development
npm run dev              # Start with nodemon (hot reload)
npm start                # Start production mode

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode for tests
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint

# Docker
docker-compose up -d            # Start all containers
docker-compose down             # Stop all containers
docker-compose logs -f api      # Follow API logs
docker-compose up -d --build    # Rebuild and start
docker ps                       # Check container status
```

---

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 20 LTS |
| Framework | Express.js | 4.18.x |
| Database | MongoDB | 7.x |
| ODM | Mongoose | 8.x |
| Authentication | JWT | 9.x |
| Password Hashing | bcryptjs | 2.4.x |
| Validation | express-validator | 7.x |
| Testing | Jest + Supertest | 29.x |
| API Documentation | Swagger UI Express | 5.x |
| Security | Helmet, CORS, Rate-limit | Latest |
| Containerization | Docker | Latest |

---

## Database Schema

The project uses MongoDB with 7 collections:

1. **teachers** - Teacher information
2. **students** - Student records with class reference
3. **classes** - Classes with teacher reference
4. **subjects** - Academic subjects
5. **trimesters** - Academic periods
6. **grades** - Student grades (references students, classes, subjects, teachers, trimesters)
7. **users** - Authentication data

**Conversion from SQL:** The project converts the relational SQL schema from `digischools.sql` to a MongoDB document-based model while maintaining data relationships through ObjectId references.

---

## Testing

### Run Tests

```bash
# All tests
npm test

# Specific test file
npm test students.test.js

# Coverage report
npm run test:coverage
```

### Test Coverage Goals
- Overall: 70%+
- Services: 80%+
- Controllers: 70%+
- Routes: 100%

---

## Docker Deployment

### Prerequisites for Docker

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

### Quick Start with Docker

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

#### Database Backup & Restore

```bash
# Backup database
docker exec digischool-mongodb mongodump --db=digischool --out=/tmp/backup
docker cp digischool-mongodb:/tmp/backup ./backup

# Restore database
docker cp ./backup digischool-mongodb:/tmp/backup
docker exec digischool-mongodb mongorestore --db=digischool /tmp/backup/digischool
```

---

### Docker Troubleshooting

#### Issue 1: Port Already in Use

**Error:** `bind: address already in use`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Host:Container
```

#### Issue 2: MongoDB Not Healthy

**Error:** `mongodb is unhealthy`

**Solution:**
```bash
# Check MongoDB logs
docker logs digischool-mongodb

# Restart MongoDB container
docker restart digischool-mongodb

# If persistent, increase start_period in docker-compose.yml
```

#### Issue 3: Cannot Connect to MongoDB from API

**Error:** `MongooseError: connect ECONNREFUSED`

**Solution:**
```bash
# Verify both containers are on same network
docker network inspect digischool-api_digischool-network

# Ensure MongoDB is healthy before API starts
docker-compose up -d
```

#### Issue 4: Container Won't Start

**Solution:**
```bash
# View container logs
docker logs digischool-api

# Remove old containers and rebuild
docker-compose down
docker-compose up -d --build

# Check for .env file
ls -la .env
```

---

### Production Deployment Notes

The Dockerfile is optimized for production:
- **Multi-stage build:** Separates build and runtime environments
- **Alpine Linux:** Minimal image size (~150MB)
- **Non-root user:** Runs as `node` user for security
- **Health checks:** Automatic container health monitoring
- **Production dependencies only:** No dev dependencies in final image
- **dumb-init:** Proper signal handling for graceful shutdown

**For production with MongoDB Atlas:**
1. Update `MONGO_URI` in environment variables to Atlas connection string
2. Remove MongoDB container dependency
3. Configure IP whitelist in Atlas
4. Use `.env.prod` file with production secrets

---

## API Documentation

### Swagger UI

Once the server is running, access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

Features:
- Complete API documentation
- Try it out functionality
- Request/response examples
- Authentication support

### Postman Collection

Import the API endpoints into Postman for manual testing. All endpoints are documented with request/response examples.

---

## Security Features

- **Helmet:** Secure HTTP headers
- **CORS:** Cross-origin resource sharing control
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **JWT:** Stateless authentication with token expiry
- **bcrypt:** Password hashing with salt (10 rounds)
- **Input Validation:** express-validator on all endpoints
- **Error Handling:** No sensitive data in production errors
- **Environment Variables:** All secrets in .env

---

## Development Team

This project is designed for a team of 3 developers:

- **Developer 1 (Backend Lead):** Project foundation, complex logic, Docker
- **Developer 2 (API Developer):** CRUD entities, JWT authentication, testing
- **Developer 3 (API Developer):** CRUD entities, Swagger documentation, testing

**Timeline:** 15 working days (3 weeks)

---

## Contributing

### Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add your feature"`
3. Push to remote: `git push origin feature/your-feature`
4. Create a pull request for review

### Commit Message Format

```
<type>: <description>

Types: feat, fix, test, docs, refactor, style, chore
```

### Code Review

All code must be reviewed by at least one team member before merging.

---

## Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod
# Or
docker start mongodb
```

**Port Already in Use:**
```bash
# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

**JWT Token Invalid:**
- Check Authorization header format: `Bearer <token>`
- Verify JWT_SECRET in .env
- Ensure token hasn't expired


---

## Roadmap

### MVP (Current)
-  Complete CRUD for 6 entities
-  JWT authentication
-  Swagger documentation
-  Docker containerization
-  70%+ test coverage

### Future Enhancements
- Pagination for large datasets
- Advanced search and filtering
- Bulk operations
- Data export (CSV, PDF)
- Email notifications
- File uploads
- Advanced RBAC
- Refresh token mechanism
- CI/CD pipeline

---

**Built with ❤️ for 3 women developers**
