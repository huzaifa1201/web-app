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
