/**
 * Script d'import des professeurs uniquement (pour tester)
 * Usage: node scripts/import-teachers-only.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Teacher = require('../src/models/Teacher');

// Données des professeurs depuis SQL
const teachers = [
  {
    nom: 'GERMAIN',
    prenom: 'Christophe',
    dateNaissance: new Date('1971-01-02'),
    adresse: '15 rue du printemps 59000 LILLE',
    sexe: 'HOMME'
  },
  {
    nom: 'LOUREIRO',
    prenom: 'Julie',
    dateNaissance: new Date('1982-01-08'),
    adresse: '72 av. Matigon 75003 Paris',
    sexe: 'FEMME'
  },
  {
    nom: 'SIMON',
    prenom: 'Jean',
    dateNaissance: new Date('1992-01-17'),
    adresse: '2 rue du Moulin 92230 Neullavy',
    sexe: 'HOMME'
  }
];

async function importTeachers() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('\n🗑️  Suppression des professeurs existants...');
    await Teacher.deleteMany({});
    console.log('✅ Collection teachers vidée');

    console.log('\n👨‍🏫 Import des professeurs...');
    for (const teacherData of teachers) {
      const teacher = await Teacher.create(teacherData);
      console.log(`  ✓ ${teacher.prenom} ${teacher.nom} (ID: ${teacher._id})`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ IMPORT TERMINÉ !');
    console.log('='.repeat(50));
    console.log(`📊 ${teachers.length} professeurs importés`);
    console.log('='.repeat(50));

    console.log('\n🔍 Vérification des données...');
    const allTeachers = await Teacher.find();
    console.log(`\nTotal dans la base : ${allTeachers.length} professeurs\n`);
    allTeachers.forEach(t => {
      console.log(`  - ${t.prenom} ${t.nom} (${t.sexe})`);
    });

    console.log('\n💡 Vous pouvez maintenant tester avec:');
    console.log('   mongosh');
    console.log('   use digischool');
    console.log('   db.teachers.find().pretty()');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
}

importTeachers();
