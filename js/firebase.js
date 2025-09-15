// Firebase initialization (compat) - fill in your project config below
(function () {
  // Replace with your Firebase project config
  const firebaseConfig = {
  apiKey: "AIzaSyCrLDB0Ub7beP-v5o6nP04dwjyoQ2jenZs",
  authDomain: "chicken-job.firebaseapp.com",
  projectId: "chicken-job",
  storageBucket: "chicken-job.firebasestorage.app",
  messagingSenderId: "1017316579915",
  appId: "1:1017316579915:web:2768ff44c89ee4dbaa0bce"
    };

  try {
    if (!window.firebase) {
      console.warn('[Firebase] SDK not loaded. Check script includes in index.html');
      return;
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();
    // Optional: Offline persistence
    if (db && typeof db.enablePersistence === 'function') {
      db.enablePersistence().catch(err => {
        console.warn('[Firebase] Persistence not enabled:', err && err.code);
      });
    }
    // Optional: You can tweak settings here
    // db.settings({ ignoreUndefinedProperties: true });

    // Expose globally for simplicity
    window.db = db;
  } catch (err) {
    console.error('[Firebase] Initialization error:', err);
  }
})();