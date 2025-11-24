/**
 * Script d'import des données SQL vers MongoDB
 * Convertit les données de digischools.sql vers les collections MongoDB
 *
 * Usage: node scripts/import-sql-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import des modèles
const Teacher = require('../src/models/Teacher');
const Student = require('../src/models/Student');
const Class = require('../src/models/Class');
const Subject = require('../src/models/Subject');
const Trimester = require('../src/models/Trimester');
const Grade = require('../src/models/Grade');

// Données SQL converties en JSON
const sqlData = {
  // Table t_prof → Collection teachers
  teachers: [
    { sqlId: 1, nom: 'GERMAIN', prenom: 'Christophe', date_naissance: new Date('1971-01-02'), adresse: '15 rue du printemps 59000 LILLE', sexe: 'HOMME' },
    { sqlId: 2, nom: 'LOUREIRO', prenom: 'Julie', date_naissance: new Date('1982-01-08'), adresse: '72 av. Matigon 75003 Paris', sexe: 'FEMME' },
    { sqlId: 3, nom: 'SIMON', prenom: 'Jean', date_naissance: new Date('1992-01-17'), adresse: '2 rue du Moulin 92230 Neullavy', sexe: 'HOMME' }
  ],

  // Table t_matiere → Collection subjects
  subjects: [
    { sqlId: 1, nom: 'LECTURE-CP' },
    { sqlId: 2, nom: 'LECTURE-CE1' },
    { sqlId: 3, nom: 'SCIENCES & DECOUVERTES' },
    { sqlId: 4, nom: 'MATHEMATIQUES' },
    { sqlId: 5, nom: 'EVEIL SPORTIF' }
  ],

  // Table t_trimestre → Collection trimesters
  trimesters: [
    { sqlId: 1, nom: 'TRIM01', date: new Date('2023-12-01T09:08:03Z') },
    { sqlId: 2, nom: 'TRIM02', date: new Date('2024-03-08T09:08:25Z') },
    { sqlId: 3, nom: 'TRIM03', date: new Date('2024-06-21T08:08:40Z') }
  ],

  // Table t_classe → Collection classes (avec référence prof)
  classes: [
    { sqlId: 1, nom: 'CP', profSqlId: 1 },
    { sqlId: 2, nom: 'CE1', profSqlId: 2 },
    { sqlId: 3, nom: 'CE2', profSqlId: 2 },
    { sqlId: 4, nom: 'CM1', profSqlId: 3 },
    { sqlId: 5, nom: 'CM2', profSqlId: 3 }
  ],

  // Table t_eleve → Collection students (avec référence classe)
  students: [
    { sqlId: 1, nom: 'Durand', prenom: 'Marie', classeSqlId: 1, date_naissance: new Date('2015-01-02'), adresse: '15 rue du Lac 75001 Paris', sexe: 'FEMME' },
    { sqlId: 2, nom: 'Alesi', prenom: 'Julie', classeSqlId: 1, date_naissance: new Date('2014-01-08'), adresse: '72 av. Jean Dupont 75003 Paris', sexe: 'FEMME' },
    { sqlId: 3, nom: 'Martini', prenom: 'Carine', classeSqlId: 5, date_naissance: new Date('2008-01-17'), adresse: '2 rue du Moulin 92230 Neullavy', sexe: 'FEMME' },
    { sqlId: 4, nom: 'Varola', prenom: 'Sophie', classeSqlId: 5, date_naissance: new Date('2009-01-21'), adresse: '15 rue du Lac 75001 Paris', sexe: 'FEMME' },
    { sqlId: 5, nom: 'Labiche', prenom: 'Lelou', classeSqlId: 5, date_naissance: new Date('2009-01-21'), adresse: '15 rue du Lac 75001 Paris', sexe: 'FEMME' },
    { sqlId: 6, nom: 'Dujardin', prenom: 'Anne', classeSqlId: 5, date_naissance: new Date('2008-02-03'), adresse: '67 rue des Jardins 91800 Brunoy', sexe: 'FEMME' },
    { sqlId: 7, nom: 'Laventure', prenom: 'Martine', classeSqlId: 5, date_naissance: new Date('2009-02-15'), adresse: '15 rue du Lac 75001 Paris', sexe: 'FEMME' },
    { sqlId: 8, nom: 'Livradu', prenom: 'Alice', classeSqlId: 5, date_naissance: new Date('2008-02-18'), adresse: '15 rue du Lac 75001 Paris', sexe: 'FEMME' },
    { sqlId: 9, nom: 'Veronicci', prenom: 'Cerise', classeSqlId: 5, date_naissance: new Date('2008-03-01'), adresse: '15 rue du Lac 75001 Paris', sexe: 'FEMME' },
    { sqlId: 10, nom: 'Baladini', prenom: 'Mathilde', classeSqlId: 5, date_naissance: new Date('2009-03-12'), adresse: '15 rue du Lac 75001 Paris', sexe: 'FEMME' },
    { sqlId: 11, nom: 'Michelet', prenom: 'Jean', classeSqlId: 2, date_naissance: new Date('2013-04-08'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 12, nom: 'Dupond', prenom: 'Pierre', classeSqlId: 2, date_naissance: new Date('2013-04-09'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 13, nom: 'Timberot', prenom: 'Martin', classeSqlId: 3, date_naissance: new Date('2011-04-14'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 14, nom: 'Gravatas', prenom: 'Paul', classeSqlId: 3, date_naissance: new Date('2011-04-15'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 15, nom: 'De La Grange', prenom: 'Luc', classeSqlId: 5, date_naissance: new Date('2008-04-16'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 16, nom: 'Millot', prenom: 'Bertrand', classeSqlId: 5, date_naissance: new Date('2009-04-20'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 17, nom: 'Herbert', prenom: 'Franck', classeSqlId: 4, date_naissance: new Date('2008-04-25'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 18, nom: 'Dupontel', prenom: 'Sylvain', classeSqlId: 4, date_naissance: new Date('2008-05-02'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 19, nom: 'Avati', prenom: 'Tom', classeSqlId: 4, date_naissance: new Date('2008-05-30'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 20, nom: 'Lidar', prenom: 'Thierry', classeSqlId: 2, date_naissance: new Date('2013-06-02'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 21, nom: 'Mo', prenom: 'Francis', classeSqlId: 2, date_naissance: new Date('2013-06-03'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 22, nom: 'Obino', prenom: 'Alex', classeSqlId: 2, date_naissance: new Date('2013-06-08'), adresse: '2 rue Jean Paul 92340 Vallodo', sexe: 'HOMME' },
    { sqlId: 23, nom: 'Martin', prenom: 'Julien', classeSqlId: 3, date_naissance: new Date('2010-06-09'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 24, nom: 'Balado', prenom: 'Arnaud', classeSqlId: 3, date_naissance: new Date('2011-06-13'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 25, nom: 'Falafav', prenom: 'Cedric', classeSqlId: 3, date_naissance: new Date('2010-06-17'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 26, nom: 'Dominicci', prenom: 'Adrien', classeSqlId: 4, date_naissance: new Date('2009-06-25'), adresse: '32 rue des Fleurs 75018 Paris', sexe: 'HOMME' },
    { sqlId: 27, nom: 'Julives', prenom: 'Fabien', classeSqlId: 4, date_naissance: new Date('2008-06-30'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 28, nom: 'Loribo', prenom: 'Paul', classeSqlId: 4, date_naissance: new Date('2008-07-04'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 29, nom: 'Allen', prenom: 'Pierre', classeSqlId: 4, date_naissance: new Date('2008-07-14'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 30, nom: 'Renaldino', prenom: 'Yann', classeSqlId: 4, date_naissance: new Date('2008-07-15'), adresse: '43 rue du Temps 75015 Paris', sexe: 'HOMME' },
    { sqlId: 31, nom: 'Margalev', prenom: 'Vincent', classeSqlId: 4, date_naissance: new Date('2008-07-31'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 32, nom: 'Roidunor', prenom: 'Denis', classeSqlId: 4, date_naissance: new Date('2008-08-01'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 33, nom: 'Tong', prenom: 'Hing', classeSqlId: 4, date_naissance: new Date('2008-08-02'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 34, nom: 'Du Chemin', prenom: 'Ludovic', classeSqlId: 3, date_naissance: new Date('2009-08-12'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 35, nom: 'Denali', prenom: 'Daniel', classeSqlId: 3, date_naissance: new Date('2010-08-22'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 36, nom: 'Maccimo', prenom: 'Marcel', classeSqlId: 3, date_naissance: new Date('2010-08-23'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 37, nom: 'Formi', prenom: 'Alexandre', classeSqlId: 3, date_naissance: new Date('2010-09-03'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 38, nom: 'Malengo', prenom: 'Tom', classeSqlId: 3, date_naissance: new Date('2010-10-04'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 39, nom: 'Legrand', prenom: 'Jean-Batiste', classeSqlId: 3, date_naissance: new Date('2010-10-05'), adresse: '14 rue des Souris 93100 Saint-Denis', sexe: 'HOMME' },
    { sqlId: 40, nom: 'Lebeau', prenom: 'Olivier', classeSqlId: 3, date_naissance: new Date('2010-10-07'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 41, nom: 'Hariford', prenom: 'John', classeSqlId: 2, date_naissance: new Date('2010-10-08'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 42, nom: 'Lessetaire', prenom: 'Hanibal', classeSqlId: 2, date_naissance: new Date('2012-10-12'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 43, nom: 'Dupont', prenom: 'Albert', classeSqlId: 2, date_naissance: new Date('2011-10-13'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 44, nom: 'Burmi', prenom: 'Nestor', classeSqlId: 2, date_naissance: new Date('2012-10-20'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 45, nom: 'Foredecafay', prenom: 'Felix', classeSqlId: 2, date_naissance: new Date('2012-10-21'), adresse: '23 av. du Ciel 75014 Paris', sexe: 'HOMME' },
    { sqlId: 46, nom: 'Lepetit', prenom: 'Nicolas', classeSqlId: 2, date_naissance: new Date('2011-11-04'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 47, nom: 'Daudet', prenom: 'Alphonse', classeSqlId: 2, date_naissance: new Date('2012-11-18'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 48, nom: 'Valegin', prenom: 'Jean', classeSqlId: 1, date_naissance: new Date('2014-11-28'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 49, nom: 'Eto', prenom: 'Gabin', classeSqlId: 1, date_naissance: new Date('2015-11-18'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 50, nom: 'Fivolini', prenom: 'Kevin', classeSqlId: 1, date_naissance: new Date('2015-12-06'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 51, nom: 'Laferme', prenom: 'Martin', classeSqlId: 1, date_naissance: new Date('2015-12-07'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 52, nom: 'Dupuis', prenom: 'Vincent', classeSqlId: 1, date_naissance: new Date('2015-12-15'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
    { sqlId: 53, nom: 'Lagrange', prenom: 'Alexandre', classeSqlId: 1, date_naissance: new Date('2014-12-28'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' }
  ],

  // Table t_notes → Collection grades (avec 5 références)
  grades: [
    { sqlId: 1, date_saisie: new Date('2019-10-15T08:07:03Z'), eleveSqlId: 2, classeSqlId: 2, matiereSqlId: 5, profSqlId: 2, trimestreSqlId: 1, note: 12, avis: 'Travail à approfondir', avancement: 0 },
    { sqlId: 2, date_saisie: new Date('2019-11-15T08:07:03Z'), eleveSqlId: 3, classeSqlId: 1, matiereSqlId: 5, profSqlId: 2, trimestreSqlId: 1, note: 15, avis: 'Bon travail', avancement: 0 },
    { sqlId: 3, date_saisie: new Date('2019-12-15T08:07:03Z'), eleveSqlId: 2, classeSqlId: 2, matiereSqlId: 5, profSqlId: 2, trimestreSqlId: 1, note: 13, avis: 'Travail en progression', avancement: 0 }
  ]
};

// Maps pour stocker les correspondances SQL ID → MongoDB ObjectId
const idMaps = {
  teachers: new Map(),
  subjects: new Map(),
  trimesters: new Map(),
  classes: new Map(),
  students: new Map()
};

async function importData() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Vider toutes les collections
    console.log('\n🗑️  Nettoyage des collections existantes...');
    await Promise.all([
      Teacher.deleteMany({}),
      Subject.deleteMany({}),
      Trimester.deleteMany({}),
      Class.deleteMany({}),
      Student.deleteMany({}),
      Grade.deleteMany({})
    ]);
    console.log('✅ Collections vidées');

    // Étape 1 : Importer les Teachers (sans dépendances)
    console.log('\n👨‍🏫 Import des professeurs...');
    for (const teacherData of sqlData.teachers) {
      const { sqlId, ...data } = teacherData;
      const teacher = await Teacher.create(data);
      idMaps.teachers.set(sqlId, teacher._id);
      console.log(`  ✓ ${teacher.prenom} ${teacher.nom} (SQL ID: ${sqlId} → MongoDB ID: ${teacher._id})`);
    }
    console.log(`✅ ${idMaps.teachers.size} professeurs importés`);

    // Étape 2 : Importer les Subjects (sans dépendances)
    console.log('\n📚 Import des matières...');
    for (const subjectData of sqlData.subjects) {
      const { sqlId, ...data } = subjectData;
      const subject = await Subject.create(data);
      idMaps.subjects.set(sqlId, subject._id);
      console.log(`  ✓ ${subject.nom} (SQL ID: ${sqlId} → MongoDB ID: ${subject._id})`);
    }
    console.log(`✅ ${idMaps.subjects.size} matières importées`);

    // Étape 3 : Importer les Trimesters (sans dépendances)
    console.log('\n📅 Import des trimestres...');
    for (const trimesterData of sqlData.trimesters) {
      const { sqlId, ...data } = trimesterData;
      const trimester = await Trimester.create(data);
      idMaps.trimesters.set(sqlId, trimester._id);
      console.log(`  ✓ ${trimester.nom} (SQL ID: ${sqlId} → MongoDB ID: ${trimester._id})`);
    }
    console.log(`✅ ${idMaps.trimesters.size} trimestres importés`);

    // Étape 4 : Importer les Classes (avec référence prof)
    console.log('\n🏫 Import des classes...');
    for (const classData of sqlData.classes) {
      const { sqlId, profSqlId, ...data } = classData;
      const classe = await Class.create({
        ...data,
        prof: idMaps.teachers.get(profSqlId)
      });
      idMaps.classes.set(sqlId, classe._id);
      console.log(`  ✓ ${classe.nom} - Prof: ${profSqlId} (SQL ID: ${sqlId} → MongoDB ID: ${classe._id})`);
    }
    console.log(`✅ ${idMaps.classes.size} classes importées`);

    // Étape 5 : Importer les Students (avec référence classe)
    console.log('\n👨‍🎓 Import des élèves...');
    for (const studentData of sqlData.students) {
      const { sqlId, classeSqlId, ...data } = studentData;
      const student = await Student.create({
        ...data,
        classe: idMaps.classes.get(classeSqlId)
      });
      idMaps.students.set(sqlId, student._id);
      console.log(`  ✓ ${student.prenom} ${student.nom} - Classe: ${classeSqlId} (SQL ID: ${sqlId})`);
    }
    console.log(`✅ ${idMaps.students.size} élèves importés`);

    // Étape 6 : Importer les Grades (avec 5 références)
    console.log('\n📝 Import des notes...');
    for (const gradeData of sqlData.grades) {
      const { sqlId, eleveSqlId, classeSqlId, matiereSqlId, profSqlId, trimestreSqlId, ...data } = gradeData;
      const grade = await Grade.create({
        ...data,
        ideleve: idMaps.students.get(eleveSqlId),
        idclasse: idMaps.classes.get(classeSqlId),
        idmatiere: idMaps.subjects.get(matiereSqlId),
        idprof: idMaps.teachers.get(profSqlId),
        idtrimestre: idMaps.trimesters.get(trimestreSqlId)
      });
      console.log(`  ✓ Note ${grade.note}/20 - Élève: ${eleveSqlId}, Matière: ${matiereSqlId} (SQL ID: ${sqlId})`);
    }
    console.log(`✅ ${sqlData.grades.length} notes importées`);

    // Afficher le résumé
    console.log('\n' + '='.repeat(50));
    console.log('✅ IMPORT TERMINÉ AVEC SUCCÈS !');
    console.log('='.repeat(50));
    console.log(`📊 Résumé :`);
    console.log(`  - ${idMaps.teachers.size} professeurs`);
    console.log(`  - ${idMaps.subjects.size} matières`);
    console.log(`  - ${idMaps.trimesters.size} trimestres`);
    console.log(`  - ${idMaps.classes.size} classes`);
    console.log(`  - ${idMaps.students.size} élèves`);
    console.log(`  - ${sqlData.grades.length} notes`);
    console.log('='.repeat(50));

    // Vérification avec populate
    console.log('\n🔍 Vérification des données avec populate...');
    const sampleClass = await Class.findOne().populate('prof');
    console.log(`\nExemple de classe avec populate:`);
    console.log(`  Classe: ${sampleClass.nom}`);
    console.log(`  Professeur: ${sampleClass.prof.prenom} ${sampleClass.prof.nom}`);

    const sampleStudent = await Student.findOne().populate('classe');
    console.log(`\nExemple d'élève avec populate:`);
    console.log(`  Élève: ${sampleStudent.prenom} ${sampleStudent.nom}`);
    console.log(`  Classe: ${sampleStudent.classe.nom}`);

    const sampleGrade = await Grade.findOne()
      .populate('ideleve', 'nom prenom')
      .populate('idclasse', 'nom')
      .populate('idmatiere', 'nom')
      .populate('idprof', 'nom prenom')
      .populate('idtrimestre', 'nom');
    console.log(`\nExemple de note avec tous les populate:`);
    console.log(`  Élève: ${sampleGrade.ideleve.prenom} ${sampleGrade.ideleve.nom}`);
    console.log(`  Classe: ${sampleGrade.idclasse.nom}`);
    console.log(`  Matière: ${sampleGrade.idmatiere.nom}`);
    console.log(`  Professeur: ${sampleGrade.idprof.prenom} ${sampleGrade.idprof.nom}`);
    console.log(`  Trimestre: ${sampleGrade.idtrimestre.nom}`);
    console.log(`  Note: ${sampleGrade.note}/20`);
    console.log(`  Avis: ${sampleGrade.avis}`);

    console.log('\n✅ Toutes les données ont été importées et vérifiées !');
    console.log('\n💡 Vous pouvez maintenant tester avec:');
    console.log('   mongosh');
    console.log('   use digischool');
    console.log('   db.teachers.find().pretty()');
    console.log('   db.students.find().pretty()');
    console.log('   db.grades.find().pretty()');

  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion MongoDB fermée');
  }
}

// Exécuter l'import
importData();
