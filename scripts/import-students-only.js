/**
 * Script d'import des élèves uniquement (sans dépendances)
 * Usage: node scripts/import-students-only.js
 *
 * Note: Utilise un ObjectId fictif pour le champ 'classe' car les classes ne sont pas encore implémentées
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('../src/models/Student');

// Données des 53 élèves depuis digischools.sql
const students = [
  { nom: 'Durand', prenom: 'Marie', dateNaissance: new Date('2015-01-02'), adresse: '15 rue du Lac 75001 Paris', sexe: 'FEMME' },
  { nom: 'Alesi', prenom: 'Julie', dateNaissance: new Date('2014-01-08'), adresse: '72 av. Jean Dupont 75003 Paris', sexe: 'FEMME' },
  { nom: 'Martini', prenom: 'Carine', dateNaissance: new Date('2008-01-17'), adresse: '2 rue du Moulin 92230 Neullavy', sexe: 'FEMME' },
  { nom: 'Varola', prenom: 'Sophie', dateNaissance: new Date('2009-01-21'), adresse: '15 rue du Lac 75001 Paris', sexe: 'FEMME' },
  { nom: 'Labiche', prenom: 'Lelou', dateNaissance: new Date('2009-01-21'), adresse: '15 rue du Lac 75001 Paris', sexe: 'FEMME' },
  { nom: 'Dujardin', prenom: 'Anne', dateNaissance: new Date('2008-02-03'), adresse: '67 rue des Jardins 91800 Brunoy', sexe: 'FEMME' },
  { nom: 'Laventure', prenom: 'Martine', dateNaissance: new Date('2009-02-15'), adresse: '15 rue du Lac 75001 Paris', sexe: 'FEMME' },
  { nom: 'Livradu', prenom: 'Alice', dateNaissance: new Date('2008-02-18'), adresse: '15 rue du Lac 75001 Paris', sexe: 'FEMME' },
  { nom: 'Veronicci', prenom: 'Cerise', dateNaissance: new Date('2008-03-01'), adresse: '15 rue du Lac 75001 Paris', sexe: 'FEMME' },
  { nom: 'Baladini', prenom: 'Mathilde', dateNaissance: new Date('2009-03-12'), adresse: '15 rue du Lac 75001 Paris', sexe: 'FEMME' },
  { nom: 'Michelet', prenom: 'Jean', dateNaissance: new Date('2013-04-08'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Dupond', prenom: 'Pierre', dateNaissance: new Date('2013-04-09'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Timberot', prenom: 'Martin', dateNaissance: new Date('2011-04-14'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Gravatas', prenom: 'Paul', dateNaissance: new Date('2011-04-15'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'De La Grange', prenom: 'Luc', dateNaissance: new Date('2008-04-16'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Millot', prenom: 'Bertrand', dateNaissance: new Date('2009-04-20'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Herbert', prenom: 'Franck', dateNaissance: new Date('2008-04-25'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Dupontel', prenom: 'Sylvain', dateNaissance: new Date('2008-05-02'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Avati', prenom: 'Tom', dateNaissance: new Date('2008-05-30'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Lidar', prenom: 'Thierry', dateNaissance: new Date('2013-06-02'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Mo', prenom: 'Francis', dateNaissance: new Date('2013-06-03'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Obino', prenom: 'Alex', dateNaissance: new Date('2013-06-08'), adresse: '2 rue Jean Paul 92340 Vallodo', sexe: 'HOMME' },
  { nom: 'Martin', prenom: 'Julien', dateNaissance: new Date('2010-06-09'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Balado', prenom: 'Arnaud', dateNaissance: new Date('2011-06-13'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Falafav', prenom: 'Cedric', dateNaissance: new Date('2010-06-17'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Dominicci', prenom: 'Adrien', dateNaissance: new Date('2009-06-25'), adresse: '32 rue des Fleurs 75018 Paris', sexe: 'HOMME' },
  { nom: 'Julives', prenom: 'Fabien', dateNaissance: new Date('2008-06-30'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Loribo', prenom: 'Paul', dateNaissance: new Date('2008-07-04'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Allen', prenom: 'Pierre', dateNaissance: new Date('2008-07-14'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Renaldino', prenom: 'Yann', dateNaissance: new Date('2008-07-15'), adresse: '43 rue du Temps 75015 Paris', sexe: 'HOMME' },
  { nom: 'Margalev', prenom: 'Vincent', dateNaissance: new Date('2008-07-31'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Roidunor', prenom: 'Denis', dateNaissance: new Date('2008-08-01'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Tong', prenom: 'Hing', dateNaissance: new Date('2008-08-02'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Du Chemin', prenom: 'Ludovic', dateNaissance: new Date('2009-08-12'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Denali', prenom: 'Daniel', dateNaissance: new Date('2010-08-22'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Maccimo', prenom: 'Marcel', dateNaissance: new Date('2010-08-23'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Formi', prenom: 'Alexandre', dateNaissance: new Date('2010-09-03'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Malengo', prenom: 'Tom', dateNaissance: new Date('2010-10-04'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Legrand', prenom: 'Jean-Batiste', dateNaissance: new Date('2010-10-05'), adresse: '14 rue des Souris 93100 Saint-Denis', sexe: 'HOMME' },
  { nom: 'Lebeau', prenom: 'Olivier', dateNaissance: new Date('2010-10-07'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Hariford', prenom: 'John', dateNaissance: new Date('2010-10-08'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Lessetaire', prenom: 'Hanibal', dateNaissance: new Date('2012-10-12'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Dupont', prenom: 'Albert', dateNaissance: new Date('2011-10-13'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Burmi', prenom: 'Nestor', dateNaissance: new Date('2012-10-20'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Foredecafay', prenom: 'Felix', dateNaissance: new Date('2012-10-21'), adresse: '23 av. du Ciel 75014 Paris', sexe: 'HOMME' },
  { nom: 'Lepetit', prenom: 'Nicolas', dateNaissance: new Date('2011-11-04'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Daudet', prenom: 'Alphonse', dateNaissance: new Date('2012-11-18'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Valegin', prenom: 'Jean', dateNaissance: new Date('2014-11-28'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Eto', prenom: 'Gabin', dateNaissance: new Date('2015-11-18'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Fivolini', prenom: 'Kevin', dateNaissance: new Date('2015-12-06'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Laferme', prenom: 'Martin', dateNaissance: new Date('2015-12-07'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Dupuis', prenom: 'Vincent', dateNaissance: new Date('2015-12-15'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' },
  { nom: 'Lagrange', prenom: 'Alexandre', dateNaissance: new Date('2014-12-28'), adresse: '15 rue du Lac 75001 Paris', sexe: 'HOMME' }
];

async function importStudents() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('✅ Connecté à MongoDB');

    // Créer un ObjectId fictif pour le champ classe (obligatoire)
    const dummyClassId = new mongoose.Types.ObjectId();
    console.log(`\n⚠️  ObjectId fictif pour classe: ${dummyClassId}`);
    console.log('   (Les classes ne sont pas encore implémentées)');

    console.log('\n🗑️  Suppression des élèves existants...');
    await Student.deleteMany({});
    console.log('✅ Collection students vidée');

    console.log('\n👨‍🎓 Import des élèves...');
    let count = 0;
    for (const studentData of students) {
      const student = await Student.create({
        ...studentData,
        classe: dummyClassId
      });
      count++;
      console.log(`  ✓ ${count}. ${student.prenom} ${student.nom} (${student.sexe})`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ IMPORT TERMINÉ !');
    console.log('='.repeat(50));
    console.log(`📊 ${count} élèves importés`);
    console.log('='.repeat(50));

    console.log('\n🔍 Vérification des données...');
    const allStudents = await Student.find();
    console.log(`\nTotal dans la base : ${allStudents.length} élèves`);

    // Statistiques
    const hommes = allStudents.filter(s => s.sexe === 'HOMME').length;
    const femmes = allStudents.filter(s => s.sexe === 'FEMME').length;
    console.log(`  - Garçons : ${hommes}`);
    console.log(`  - Filles : ${femmes}`);

    console.log('\n📋 Premiers élèves :');
    allStudents.slice(0, 5).forEach((s, i) => {
      console.log(`  ${i+1}. ${s.prenom} ${s.nom} - ${s.sexe} (né(e) le ${s.dateNaissance.toLocaleDateString('fr-FR')})`);
    });

    console.log('\n💡 Vous pouvez maintenant tester avec:');
    console.log('   mongosh digischool');
    console.log('   db.students.find().pretty()');
    console.log('   db.students.countDocuments()');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion MongoDB fermée');
  }
}

importStudents();
