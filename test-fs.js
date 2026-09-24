import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

async function run() {
  const account = JSON.parse(await readFile('./service-account.json', 'utf8'));
  initializeApp({ credential: cert(account) });
  const db = getFirestore();
  const snap = await db.collection('deposits').orderBy('timestamp', 'desc').limit(10).get();
  snap.docs.forEach(d => console.log(d.id, d.data()));
}
run();
