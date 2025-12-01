/**
 * Test Fixtures for Unit Tests
 * Sample data for all entities
 */

const ObjectId = require('mongoose').Types.ObjectId;

// Generate mock ObjectIds
const mockIds = {
  teacher1: new ObjectId().toString(),
  teacher2: new ObjectId().toString(),
  student1: new ObjectId().toString(),
  student2: new ObjectId().toString(),
  class1: new ObjectId().toString(),
  class2: new ObjectId().toString(),
  subject1: new ObjectId().toString(),
  subject2: new ObjectId().toString(),
  trimester1: new ObjectId().toString(),
  trimester2: new ObjectId().toString(),
  grade1: new ObjectId().toString(),
  user1: new ObjectId().toString()
};

// Teacher fixtures
const validTeacher = {
  _id: mockIds.teacher1,
  nom: 'Dupont',
  prenom: 'Jean',
  dateNaissance: new Date('1980-05-15'),
  adresse: '15 rue du printemps 59000 LILLE',
  sexe: 'HOMME',
  createdAt: new Date(),
  updatedAt: new Date()
};

const validTeacherInput = {
  nom: 'Martin',
  prenom: 'Sophie',
  dateNaissance: '1985-03-20',
  adresse: '25 avenue Victor Hugo',
  sexe: 'FEMME'
};

const invalidTeacherInput = {
  nom: '',  // Invalid: empty string
  prenom: 'Test',
  dateNaissance: '2030-01-01',  // Invalid: future date
  sexe: 'INVALID'  // Invalid: not HOMME or FEMME
};

// Student fixtures
const validStudent = {
  _id: mockIds.student1,
  nom: 'Leroy',
  prenom: 'Thomas',
  classe: mockIds.class1,
  dateNaissance: new Date('2010-03-20'),
  adresse: '456 Avenue Victor Hugo, 75016 Paris',
  sexe: 'HOMME',
  createdAt: new Date(),
  updatedAt: new Date()
};

const validStudentInput = {
  nom: 'Bernard',
  prenom: 'Marie',
  classe: mockIds.class1,
  dateNaissance: '2011-06-15',
  sexe: 'FEMME'
};

// Class fixtures
const validClass = {
  _id: mockIds.class1,
  nom: 'CM1',
  prof: mockIds.teacher1,
  createdAt: new Date(),
  updatedAt: new Date()
};

const validClassWithPopulate = {
  _id: mockIds.class1,
  nom: 'CM1',
  prof: {
    _id: mockIds.teacher1,
    nom: 'Dupont',
    prenom: 'Jean'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// Subject fixtures
const validSubject = {
  _id: mockIds.subject1,
  nom: 'MATHEMATIQUES',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Trimester fixtures
const validTrimester = {
  _id: mockIds.trimester1,
  nom: 'TRIM01',
  date: new Date('2023-12-01'),
  createdAt: new Date(),
  updatedAt: new Date()
};

// Grade fixtures
const validGrade = {
  _id: mockIds.grade1,
  dateSaisie: new Date(),
  ideleve: mockIds.student1,
  idclasse: mockIds.class1,
  idmatiere: mockIds.subject1,
  idprof: mockIds.teacher1,
  idtrimestre: mockIds.trimester1,
  note: 15,
  avis: 'Bon travail',
  avancement: 75,
  createdAt: new Date(),
  updatedAt: new Date()
};

const validGradeInput = {
  ideleve: mockIds.student1,
  idclasse: mockIds.class1,
  idmatiere: mockIds.subject1,
  idprof: mockIds.teacher1,
  idtrimestre: mockIds.trimester1,
  note: 18,
  avis: 'Excellent',
  avancement: 90
};

const invalidGradeInput = {
  note: 25,  // Invalid: exceeds max 20
  avancement: 150  // Invalid: exceeds max 100
};

// User fixtures
const validUser = {
  _id: mockIds.user1,
  username: 'jdupont',
  email: 'jean.dupont@digischool.fr',
  password: '$2a$10$hashedpassword',  // Hashed password
  role: 'teacher',
  createdAt: new Date(),
  updatedAt: new Date()
};

const validUserInput = {
  username: 'smartin',
  email: 'sophie.martin@digischool.fr',
  password: 'SecurePass123!',
  role: 'teacher'
};

// Edge cases
const edgeCases = {
  nullValue: null,
  undefinedValue: undefined,
  emptyString: '',
  emptyArray: [],
  emptyObject: {},
  invalidObjectId: 'invalid-id-format',
  nonExistentId: new ObjectId().toString()
};

module.exports = {
  mockIds,
  teachers: {
    valid: validTeacher,
    validInput: validTeacherInput,
    invalid: invalidTeacherInput
  },
  students: {
    valid: validStudent,
    validInput: validStudentInput
  },
  classes: {
    valid: validClass,
    validWithPopulate: validClassWithPopulate
  },
  subjects: {
    valid: validSubject
  },
  trimesters: {
    valid: validTrimester
  },
  grades: {
    valid: validGrade,
    validInput: validGradeInput,
    invalid: invalidGradeInput
  },
  users: {
    valid: validUser,
    validInput: validUserInput
  },
  edgeCases
};
