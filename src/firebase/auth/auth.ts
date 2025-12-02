'use client';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { initializeFirebase } from '../';

const { app } = initializeFirebase();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Add required YouTube API scopes
provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
provider.addScope('https://www.googleapis.com/auth/yt-analytics.readonly');

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential) {
      throw new Error('Could not get credential from result.');
    }
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    
    // Try to fetch and save YouTube channel ID
    if (token) {
      try {
        const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (channelResponse.ok) {
          const channelData = await channelResponse.json();
          if (channelData.items && channelData.items.length > 0) {
            const channelId = channelData.items[0].id;
            // Save channel ID to user's profile
            const { initializeFirebase } = await import('../');
            const { firestore } = initializeFirebase();
            const { doc, setDoc } = await import('firebase/firestore');
            await setDoc(
              doc(firestore, 'users', user.uid),
              {
                youtubeChannelId: channelId,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }
        }
      } catch (error) {
        console.error('Error fetching YouTube channel ID:', error);
        // Don't throw - channel ID fetch is optional
      }
    }

    return { user, token };
  } catch (error: any) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData?.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    console.error(
      'Google Sign-In Error:',
      errorCode,
      errorMessage,
      email,
      credential
    );
    throw error;
  }
};

export const signOutWithGoogle = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const signInWithEmailPassword = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user };
  } catch (error: any) {
    console.error('Email Sign-In Error:', error.code, error.message);
    throw error;
  }
};

export const registerWithEmailPassword = async (
  email: string,
  password: string,
  displayName?: string
) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    
    return { user: result.user };
  } catch (error: any) {
    console.error('Email Registration Error:', error.code, error.message);
    throw error;
  }
};
