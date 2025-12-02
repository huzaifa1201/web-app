'use server';

import { initializeFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export async function saveApiKeys(userId: string, keys: {
  geminiApiKey?: string;
  youtubeApiKey?: string;
  googleTrendsApiKey?: string;
}) {
  try {
    const { firestore } = initializeFirebase();
    await setDoc(
      doc(firestore, 'userApiKeys', userId),
      {
        ...keys,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error('Error saving API keys:', error);
    throw error;
  }
}

export async function getApiKeys(userId: string) {
  try {
    const { firestore } = initializeFirebase();
    const docRef = doc(firestore, 'userApiKeys', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        geminiApiKey: docSnap.data().geminiApiKey || '',
        youtubeApiKey: docSnap.data().youtubeApiKey || '',
        googleTrendsApiKey: docSnap.data().googleTrendsApiKey || '',
      };
    }
    return {
      geminiApiKey: '',
      youtubeApiKey: '',
      googleTrendsApiKey: '',
    };
  } catch (error) {
    console.error('Error getting API keys:', error);
    return {
      geminiApiKey: '',
      youtubeApiKey: '',
      googleTrendsApiKey: '',
    };
  }
}

