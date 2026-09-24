import { db } from './src/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function run() {
  const querySnapshot = await getDocs(collection(db, "kycRequests"));
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} =>`, doc.data());
  });
}
run().catch(console.error);
