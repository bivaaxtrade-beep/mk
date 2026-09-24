
import { adminDb } from './src/lib/firebase-admin';

async function test() {
  console.log('Testing Firestore connection to bivaax-trade-999...');
  try {
    const testRef = adminDb.collection('test').doc('connection');
    await testRef.set({ timestamp: Date.now() });
    const doc = await testRef.get();
    if (doc.exists) {
      console.log('✅ Firestore connection successful!');
      console.log('Data:', doc.data());
    } else {
      console.log('❌ Document does not exist.');
    }
  } catch (err: any) {
    console.error('❌ Connection failed:', err.message);
  }
}

test();
