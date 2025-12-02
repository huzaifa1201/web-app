// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that all required Firebase config values are present
const validateFirebaseConfig = () => {
  const missing: string[] = [];
  
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key') {
    missing.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  }
  if (!firebaseConfig.authDomain || firebaseConfig.authDomain === 'your-auth-domain') {
    missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  }
  if (!firebaseConfig.projectId || firebaseConfig.projectId === 'your-project-id') {
    missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  }
  if (!firebaseConfig.storageBucket || firebaseConfig.storageBucket === 'your-storage-bucket') {
    missing.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  }
  if (!firebaseConfig.messagingSenderId || firebaseConfig.messagingSenderId === 'your-messaging-sender-id') {
    missing.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  }
  if (!firebaseConfig.appId || firebaseConfig.appId === 'your-app-id') {
    missing.push('NEXT_PUBLIC_FIREBASE_APP_ID');
  }
  
  if (missing.length > 0) {
    const errorMessage = `Firebase configuration is missing. Please set the following environment variables in your .env.local file:\n${missing.join('\n')}\n\nTo get your Firebase credentials:\n1. Go to https://console.firebase.google.com/\n2. Create a new project or select an existing one\n3. Go to Project Settings > General\n4. Scroll down to "Your apps" and click on the web app icon\n5. Copy the config values to your .env.local file`;
    
    if (typeof window === 'undefined') {
      // Server-side: throw error
      throw new Error(errorMessage);
    } else {
      // Client-side: log error and show alert
      console.error('Firebase Configuration Error:', errorMessage);
      console.error('Missing environment variables:', missing);
    }
  }
  
  return true;
};

// Validate config when module loads (only on client-side to avoid SSR issues)
if (typeof window !== 'undefined') {
  validateFirebaseConfig();
}

export default firebaseConfig;
