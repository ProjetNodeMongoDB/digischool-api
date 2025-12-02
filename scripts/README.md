# Database Seeding Scripts

## seedDatabase.js

A comprehensive script to populate the DigiSchool database with realistic test data.

### What it creates:

- **5 Teachers** - French teachers with realistic names and addresses
- **6 Subjects** - Common French school subjects (Maths, French, History, etc.)
- **3 Trimesters** - Academic year divided into 3 periods (T1, T2, T3)
- **5 Classes** - CM1-A, CM1-B, CM2-A, CM2-B, 6ème-A
- **30 Students** - Students distributed across classes
- **5 Users** - Sample admin, teacher, and student accounts with authentication
- **540 Grades** - Complete grade records linking students, classes, subjects, teachers, and trimesters

**Total: 594 records**

### Prerequisites:

1. MongoDB must be running (via Docker or locally)
2. `.env` file must be configured with `MONGO_URI`

### Usage:

```bash
# Run the seed script
npm run seed
```

### What it does:

1. Connects to MongoDB using `MONGO_URI` from `.env`
2. **Clears all existing data** from all collections
3. Creates entities in the correct order (respecting relationships)
4. Links all entities properly (students to classes, grades to all entities)
5. Provides a summary of created records

### Sample Credentials:

After seeding, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@digischool.fr | Admin123! |
| Teacher | marie.dubois@digischool.fr | Teacher123! |
| Teacher | jean.martin@digischool.fr | Teacher123! |
| Student | lucas.dupont@digischool.fr | Student123! |
| Student | emma.bernard@digischool.fr | Student123! |

### Features:

- Realistic French names and addresses
- Students properly distributed across 5 classes
- Each student has grades for all subjects across all trimesters
- Random grades between 8-20 (French grading system)
- Random coefficients (1, 1.5, 2, 2.5, 3)
- Bcrypt-hashed passwords for all users
- Proper ObjectId references throughout

### Development Tips:

- Run this script whenever you need fresh test data
- Useful for testing API endpoints with populated data
- Great for development and integration testing
- Can be run multiple times (clears existing data first)

### Warning:

**This script will DELETE all existing data** in the following collections:
- teachers
- students
- classes
- subjects
- trimesters
- grades
- users

Only use in development environments!
