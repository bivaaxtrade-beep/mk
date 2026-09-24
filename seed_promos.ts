
import { db } from './src/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const promos = [
  {
    code: 'FIRST100',
    bonusPercentage: 100,
    isActive: true,
    isBonusActive: true,
    expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
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
    const q = query(collection(db, 'promos'), where('code', '==', promo.code));
    const snap = await getDocs(q);
    if (snap.empty) {
      await addDoc(collection(db, 'promos'), promo);
      console.log(`Added promo: ${promo.code}`);
    } else {
      console.log(`Promo ${promo.code} already exists.`);
    }
  }
  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
