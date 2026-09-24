const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Read config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));

// Initialize with a mock or real credentials if available, 
// but here we can just use the environment variables if they are set.
// Actually, in this environment, we should use the standard firebase-admin initialization.

if (!process.env.FIREBASE_PROJECT_ID) {
  process.env.FIREBASE_PROJECT_ID = firebaseConfig.projectId;
}

const app = initializeApp({
  projectId: firebaseConfig.projectId
});

const db = getFirestore(app);

const promos = [
  {
    code: 'FIRST100',
    bonusPercentage: 100,
    isActive: true,
    isBonusActive: true,
    expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    description: '100% Bonus on your first deposit'
  },
  {
    code: 'BIVAAX50',
    bonusPercentage: 50,
    isActive: true,
    isBonusActive: true,
    expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    description: '50% Bonus on any deposit'
  }
];

async function seed() {
  console.log('Seeding promos...');
  for (const promo of promos) {
    const q = await db.collection('promos').where('code', '==', promo.code).get();
    if (q.empty) {
      await db.collection('promos').add(promo);
      console.log(`Added promo: ${promo.code}`);
    } else {
      console.log(`Promo ${promo.code} already exists.`);
    }
  }
  console.log('Seeding complete.');
}

seed().catch(console.error);
