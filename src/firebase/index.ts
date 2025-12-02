import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from './config';

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

// This function ensures that we initialize the app only once
export const initializeFirebase = (): FirebaseInstances => {
  // Validate Firebase config before initializing
  if (!firebaseConfig.apiKey || 
      !firebaseConfig.authDomain || 
      !firebaseConfig.projectId ||
      firebaseConfig.apiKey === 'your-api-key' ||
      firebaseConfig.authDomain === 'your-auth-domain' ||
      firebaseConfig.projectId === 'your-project-id') {
    const errorMessage = 'Firebase configuration is missing or incomplete. Please check your .env.local file.';
    console.error('Firebase Configuration Error:', errorMessage);
    console.error('Current config:', {
      apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
      authDomain: firebaseConfig.authDomain ? 'Set' : 'Missing',
      projectId: firebaseConfig.projectId ? 'Set' : 'Missing',
    });
    
    if (typeof window !== 'undefined') {
      // Only throw on client-side to avoid breaking SSR
      throw new Error(errorMessage);
    }
  }

  const apps = getApps();
  let app: FirebaseApp;

  if (!apps.length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
};
