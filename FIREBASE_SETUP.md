# Firebase Setup Guide

## Problem
Agar aapko sign up ya login mein problem aa rahi hai, to iska matlab hai ke Firebase properly configured nahi hai.

## Solution

### Step 1: Firebase Project Create Karein

1. [Firebase Console](https://console.firebase.google.com/) par jayein
2. "Add project" click karein
3. Project name enter karein
4. Google Analytics enable/disable karein (optional)
5. "Create project" click karein

### Step 2: Web App Add Karein

1. Firebase Console mein apne project mein jayein
2. Left sidebar mein gear icon (⚙️) par click karein
3. "Project settings" select karein
4. "General" tab mein scroll karein
5. "Your apps" section mein web app icon (</>) par click karein
6. App nickname enter karein (optional)
7. "Register app" click karein
8. Firebase config values copy karein

### Step 3: Environment Variables Set Karein

1. Project root mein `.env.local` file create karein
2. Neeche diye gaye format mein Firebase credentials add karein:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Important:** `your-api-key-here`, `your-project-id`, etc. ko apne actual Firebase values se replace karein.

### Step 4: Authentication Enable Karein

1. Firebase Console mein "Authentication" section mein jayein
2. "Get started" click karein
3. "Sign-in method" tab select karein
4. "Email/Password" enable karein
5. "Google" enable karein (agar Google sign-in chahiye)

### Step 5: Firestore Database Setup Karein

1. Firebase Console mein "Firestore Database" section mein jayein
2. "Create database" click karein
3. "Start in test mode" select karein (development ke liye)
4. Location select karein
5. "Enable" click karein

### Step 6: App Restart Karein

1. Development server band karein (Ctrl+C)
2. Phir se start karein: `npm run dev`
3. Ab sign up aur login kaam karna chahiye

## Troubleshooting

### Error: "Firebase configuration is missing"
- Check karein ke `.env.local` file project root mein hai
- Environment variables ke names sahi hain (NEXT_PUBLIC_ prefix ke saath)
- Values mein koi placeholder text nahi hai (jaise "your-api-key")

### Error: "Invalid Firebase API key"
- Firebase Console se API key dobara copy karein
- `.env.local` file mein sahi value paste karein
- Server restart karein

### Error: "Network request failed"
- Internet connection check karein
- Firebase project properly setup hai ya nahi verify karein
- Browser console mein detailed errors check karein

## Example .env.local File

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyExample1234567890
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=myproject.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=myproject-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=myproject-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Note:** `.env.local` file ko git mein commit mat karein (yeh already `.gitignore` mein hai).

