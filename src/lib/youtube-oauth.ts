'use server';

import { initializeFirebase } from '@/firebase';
import { getAuth } from 'firebase/auth';

/**
 * Get YouTube channel ID from user's Google OAuth token
 * This requires the user to be authenticated with Google and have YouTube scope
 */
export async function getYouTubeChannelIdFromOAuth(userId: string): Promise<string | null> {
  try {
    const { auth } = initializeFirebase();
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }
    
    // Get the access token from Firebase Auth
    const token = await user.getIdToken();
    
    // Note: To get YouTube channel ID, we need the actual Google OAuth access token
    // Firebase Auth's ID token doesn't include YouTube API access
    // We need to store the OAuth access token separately when user signs in with Google
    
    // For now, try to get from user's custom claims or stored token
    // In production, you would store the OAuth access token when user signs in
    
    return null;
  } catch (error) {
    console.error('Error getting YouTube channel ID from OAuth:', error);
    return null;
  }
}

/**
 * Save YouTube channel ID to user's profile
 */
export async function saveYouTubeChannelId(userId: string, channelId: string): Promise<void> {
  try {
    const { firestore } = initializeFirebase();
    const { doc, setDoc } = await import('firebase/firestore');
    
    await setDoc(
      doc(firestore, 'users', userId),
      {
        youtubeChannelId: channelId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving YouTube channel ID:', error);
    throw error;
  }
}

