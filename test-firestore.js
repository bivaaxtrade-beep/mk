const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
async function test() {
  const snap = await db.collection('deposits').limit(5).get();
  snap.docs.forEach(d => console.log(d.id, d.data()));
}
test();
