require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');

// Import models
const Teacher = require('../src/models/Teacher');
const Student = require('../src/models/Student');
const Class = require('../src/models/Class');
const Subject = require('../src/models/Subject');
const Trimester = require('../src/models/Trimester');
const Grade = require('../src/models/Grade');
const User = require('../src/models/User');

// Sample data
const teachersData = [
  {
    nom: 'Dubois',
    prenom: 'Marie',
    sexe: 'FEMME',
    dateNaissance: new Date('1985-03-15'),
    adresse: '12 Rue de la République, 75001 Paris',
  },
  {
    nom: 'Martin',
    prenom: 'Jean',
    sexe: 'HOMME',
    dateNaissance: new Date('1980-07-22'),
    adresse: '45 Avenue des Champs-Élysées, 75008 Paris',
  },
  {
    nom: 'Lefebvre',
    prenom: 'Sophie',
    sexe: 'FEMME',
    dateNaissance: new Date('1990-11-08'),
    adresse: '78 Boulevard Saint-Germain, 75005 Paris',
  },
  {
    nom: 'Moreau',
    prenom: 'Pierre',
    sexe: 'HOMME',
    dateNaissance: new Date('1978-05-30'),
    adresse: '23 Rue du Faubourg, 75010 Paris',
  },
  {
    nom: 'Laurent',
    prenom: 'Claire',
    sexe: 'FEMME',
    dateNaissance: new Date('1988-09-14'),
    adresse: '56 Avenue de la Liberté, 75011 Paris',
  },
];

const subjectsData = [
  { nom: 'Mathématiques' },
  { nom: 'Français' },
  { nom: 'Histoire-Géographie' },
  { nom: 'Sciences et Vie de la Terre' },
  { nom: 'Anglais' },
  { nom: 'Éducation Physique et Sportive' },
];

const trimestersData = [
  { nom: 'T1', date: new Date('2024-09-01') },
  { nom: 'T2', date: new Date('2025-01-01') },
  { nom: 'T3', date: new Date('2025-04-01') },
];

const classesData = [
  { nom: 'CM1-A' },
  { nom: 'CM1-B' },
  { nom: 'CM2-A' },
  { nom: 'CM2-B' },
  { nom: '6ème-A' },
];

const studentsData = [
  { nom: 'Dupont', prenom: 'Lucas', sexe: 'HOMME', dateNaissance: new Date('2014-01-15'), adresse: '10 Rue Voltaire, 75011 Paris' },
  { nom: 'Bernard', prenom: 'Emma', sexe: 'FEMME', dateNaissance: new Date('2014-03-22'), adresse: '25 Avenue Gambetta, 75020 Paris' },
  { nom: 'Thomas', prenom: 'Louis', sexe: 'HOMME', dateNaissance: new Date('2014-05-10'), adresse: '33 Rue de la Paix, 75002 Paris' },
  { nom: 'Petit', prenom: 'Chloé', sexe: 'FEMME', dateNaissance: new Date('2014-07-08'), adresse: '42 Boulevard Haussmann, 75009 Paris' },
  { nom: 'Robert', prenom: 'Hugo', sexe: 'HOMME', dateNaissance: new Date('2014-09-19'), adresse: '18 Rue Montmartre, 75001 Paris' },
  { nom: 'Richard', prenom: 'Léa', sexe: 'FEMME', dateNaissance: new Date('2014-11-30'), adresse: '67 Avenue Victor Hugo, 75016 Paris' },
  { nom: 'Durand', prenom: 'Nathan', sexe: 'HOMME', dateNaissance: new Date('2013-02-14'), adresse: '5 Rue Lafayette, 75009 Paris' },
  { nom: 'Simon', prenom: 'Manon', sexe: 'FEMME', dateNaissance: new Date('2013-04-25'), adresse: '88 Boulevard de Clichy, 75018 Paris' },
  { nom: 'Michel', prenom: 'Arthur', sexe: 'HOMME', dateNaissance: new Date('2013-06-12'), adresse: '14 Rue de Rivoli, 75004 Paris' },
  { nom: 'Laurent', prenom: 'Jade', sexe: 'FEMME', dateNaissance: new Date('2013-08-07'), adresse: '29 Avenue Montaigne, 75008 Paris' },
  { nom: 'Lefevre', prenom: 'Gabriel', sexe: 'HOMME', dateNaissance: new Date('2013-10-22'), adresse: '51 Rue du Bac, 75007 Paris' },
  { nom: 'Leroy', prenom: 'Alice', sexe: 'FEMME', dateNaissance: new Date('2013-12-05'), adresse: '76 Boulevard Raspail, 75006 Paris' },
  { nom: 'Moreau', prenom: 'Raphaël', sexe: 'HOMME', dateNaissance: new Date('2014-02-18'), adresse: '22 Rue de Rennes, 75006 Paris' },
  { nom: 'Girard', prenom: 'Zoé', sexe: 'FEMME', dateNaissance: new Date('2014-04-09'), adresse: '39 Avenue de Wagram, 75017 Paris' },
  { nom: 'Bonnet', prenom: 'Tom', sexe: 'HOMME', dateNaissance: new Date('2014-06-21'), adresse: '63 Rue de la Pompe, 75016 Paris' },
  { nom: 'Fontaine', prenom: 'Lola', sexe: 'FEMME', dateNaissance: new Date('2014-08-16'), adresse: '8 Boulevard Beaumarchais, 75011 Paris' },
  { nom: 'Chevalier', prenom: 'Jules', sexe: 'HOMME', dateNaissance: new Date('2014-10-03'), adresse: '47 Rue du Temple, 75004 Paris' },
  { nom: 'Garnier', prenom: 'Inès', sexe: 'FEMME', dateNaissance: new Date('2014-12-27'), adresse: '55 Avenue de Saxe, 75007 Paris' },
  { nom: 'Boyer', prenom: 'Enzo', sexe: 'HOMME', dateNaissance: new Date('2013-01-11'), adresse: '91 Rue de Charonne, 75011 Paris' },
  { nom: 'Blanc', prenom: 'Camille', sexe: 'FEMME', dateNaissance: new Date('2013-03-28'), adresse: '17 Boulevard Saint-Michel, 75005 Paris' },
  { nom: 'Rousseau', prenom: 'Maxime', sexe: 'HOMME', dateNaissance: new Date('2013-05-15'), adresse: '34 Rue de la Roquette, 75011 Paris' },
  { nom: 'Vincent', prenom: 'Sarah', sexe: 'FEMME', dateNaissance: new Date('2013-07-04'), adresse: '68 Avenue Parmentier, 75011 Paris' },
  { nom: 'Fournier', prenom: 'Théo', sexe: 'HOMME', dateNaissance: new Date('2013-09-19'), adresse: '12 Rue Oberkampf, 75011 Paris' },
  { nom: 'Giraud', prenom: 'Lily', sexe: 'FEMME', dateNaissance: new Date('2013-11-08'), adresse: '26 Boulevard Richard-Lenoir, 75011 Paris' },
  { nom: 'Roux', prenom: 'Paul', sexe: 'HOMME', dateNaissance: new Date('2012-01-20'), adresse: '73 Rue de Belleville, 75019 Paris' },
  { nom: 'Morel', prenom: 'Anna', sexe: 'FEMME', dateNaissance: new Date('2012-03-13'), adresse: '41 Avenue Philippe Auguste, 75011 Paris' },
  { nom: 'Andre', prenom: 'Adam', sexe: 'HOMME', dateNaissance: new Date('2012-05-25'), adresse: '59 Rue des Pyrénées, 75020 Paris' },
  { nom: 'Mercier', prenom: 'Lucie', sexe: 'FEMME', dateNaissance: new Date('2012-07-17'), adresse: '84 Boulevard Voltaire, 75011 Paris' },
  { nom: 'Blanchard', prenom: 'Noah', sexe: 'HOMME', dateNaissance: new Date('2012-09-09'), adresse: '15 Rue de la Folie-Méricourt, 75011 Paris' },
  { nom: 'Gauthier', prenom: 'Rose', sexe: 'FEMME', dateNaissance: new Date('2012-11-22'), adresse: '38 Avenue Ledru-Rollin, 75012 Paris' },
];

const usersData = [
  { username: 'admin', email: 'admin@digischool.fr', password: 'Admin123!', role: 'admin' },
  { username: 'marie_dubois', email: 'marie.dubois@digischool.fr', password: 'Teacher123!', role: 'teacher' },
  { username: 'jean_martin', email: 'jean.martin@digischool.fr', password: 'Teacher123!', role: 'teacher' },
  { username: 'lucas_dupont', email: 'lucas.dupont@digischool.fr', password: 'Student123!', role: 'student' },
  { username: 'emma_bernard', email: 'emma.bernard@digischool.fr', password: 'Student123!', role: 'student' },
];

// Helper function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to generate random grade between min and max
const getRandomGrade = (min = 8, max = 20) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
};

// Helper function to get random coefficient
const getRandomCoefficient = () => {
  const coefficients = [1, 1.5, 2, 2.5, 3];
  return getRandomItem(coefficients);
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Teacher.deleteMany({}),
      Student.deleteMany({}),
      Class.deleteMany({}),
      Subject.deleteMany({}),
      Trimester.deleteMany({}),
      Grade.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('✅ Existing data cleared\n');

    // 1. Create Teachers
    console.log('👨‍🏫 Creating teachers...');
    const teachers = await Teacher.insertMany(teachersData);
    console.log(`✅ Created ${teachers.length} teachers\n`);

    // 2. Create Subjects
    console.log('📚 Creating subjects...');
    const subjects = await Subject.insertMany(subjectsData);
    console.log(`✅ Created ${subjects.length} subjects\n`);

    // 3. Create Trimesters
    console.log('📅 Creating trimesters...');
    const trimesters = await Trimester.insertMany(trimestersData);
    console.log(`✅ Created ${trimesters.length} trimesters\n`);

    // 4. Create Classes (assign each class to a teacher)
    console.log('🏫 Creating classes...');
    const classesWithTeachers = classesData.map((classData, index) => ({
      ...classData,
      prof: teachers[index % teachers.length]._id,
    }));
    const classes = await Class.insertMany(classesWithTeachers);
    console.log(`✅ Created ${classes.length} classes\n`);

    // 5. Create Students (distribute across classes)
    console.log('👨‍🎓 Creating students...');
    const studentsWithClasses = studentsData.map((studentData, index) => ({
      ...studentData,
      classe: classes[index % classes.length]._id,
    }));
    const students = await Student.insertMany(studentsWithClasses);
    console.log(`✅ Created ${students.length} students\n`);

    // 6. Create Users (using .save() to trigger password hashing hook)
    console.log('👤 Creating users...');
    const users = [];
    for (const userData of usersData) {
      const user = new User(userData);
      await user.save(); // Triggers pre-save hook for password hashing
      users.push(user);
    }
    console.log(`✅ Created ${users.length} users\n`);

    // 7. Create Grades (link everything together)
    console.log('📊 Creating grades...');
    const gradesData = [];

    // Generate grades for each student, for each subject, for each trimester
    students.forEach((student) => {
      subjects.forEach((subject) => {
        trimesters.forEach((trimester) => {
          // Get the class this student belongs to
          const studentClass = classes.find(c => c._id.equals(student.classe));

          // Get the teacher assigned to this class
          const teacher = teachers.find(t => t._id.equals(studentClass.prof));

          gradesData.push({
            ideleve: student._id,
            idclasse: student.classe,
            idmatiere: subject._id,
            idprof: teacher._id,
            idtrimestre: trimester._id,
            note: getRandomGrade(),
            coefficient: getRandomCoefficient(),
          });
        });
      });
    });

    const grades = await Grade.insertMany(gradesData);
    console.log(`✅ Created ${grades.length} grades\n`);

    // Summary
    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Teachers: ${teachers.length}`);
    console.log(`   - Subjects: ${subjects.length}`);
    console.log(`   - Trimesters: ${trimesters.length}`);
    console.log(`   - Classes: ${classes.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Grades: ${grades.length}`);
    console.log(`   - TOTAL RECORDS: ${teachers.length + subjects.length + trimesters.length + classes.length + students.length + users.length + grades.length}`);
    console.log('\n📝 Sample credentials:');
    console.log('   Admin: admin@digischool.fr / Admin123!');
    console.log('   Teacher: marie.dubois@digischool.fr / Teacher123!');
    console.log('   Student: lucas.dupont@digischool.fr / Student123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
