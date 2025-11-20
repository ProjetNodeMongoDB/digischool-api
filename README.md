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
docker-compose up -d     # Start all containers
docker-compose down      # Stop all containers
docker-compose logs -f   # View logs
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

### Build and Run with Docker

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop containers
docker-compose down
```

The Docker setup includes:
- **API container:** Node.js application on port 3000
- **MongoDB container:** MongoDB 7 on port 27017
- **Network:** Bridge network for container communication
- **Volume:** Persistent MongoDB storage

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

This project is designed for a team of 3 junior developers:

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
