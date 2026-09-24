import { adminDb } from './src/lib/firebase-admin.ts';

async function run() {
  if (!adminDb) {
    console.log("No adminDb initialized. Check permissions or environment variables.");
    return;
  }
  
  // Wait a moment for any async init in firebase-admin module to complete if necessary
  await new Promise(r => setTimeout(r, 1000));
  
  const stories = await adminDb.collection('stories').get();
  let deletedCount = 0;
  for (const doc of stories.docs) {
    const data = doc.data();
    if (data.title === 'Market Overview' || data.title === 'New Mechanics') {
      console.log('Deleting:', data.title, doc.id);
      await doc.ref.delete();
      deletedCount++;
    }
  }
  console.log(`Deleted ${deletedCount} documents. Done.`);
  process.exit(0);
}

run().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
