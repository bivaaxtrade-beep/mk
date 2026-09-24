import { adminDb } from './src/lib/firebase-admin';

async function run() {
  if (!adminDb) {
    console.log("adminDb is null");
    return;
  }
  const snap = await adminDb.collection('kycRequests').get();
  console.log(`Found ${snap.size} docs in kycRequests`);
  snap.forEach(doc => console.log(doc.id, doc.data()));
}
run().catch(console.error);
