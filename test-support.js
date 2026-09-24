const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// We can't easily test firestore directly without the user's auth token,
// unless we use the REST API with a token or use the admin SDK.
