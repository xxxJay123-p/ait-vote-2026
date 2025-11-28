# Annual Gala Night - Best Costume Award Voting App

A beautiful, cinematic voting application with neon aesthetics and SQLite backend.

**注意**: 此專案已改用 SQLite 後端，不再使用 Firebase。請參考 `README_SQLITE.md` 了解如何運行。

## Features

- 🎨 Cinematic Hong Kong-inspired design with neon effects
- 🔥 Real-time voting with Firebase Firestore
- 📱 Responsive design for mobile and desktop
- 🎭 Gender-based categories (Gentlemen/Ladies)
- 📊 Live leaderboard with rankings
- 📱 QR code sharing
- ✨ Glassmorphism UI with film grain effects

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Firestore enabled

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Firestore Database** (start in test mode for development)
4. Go to **Project Settings** > **General** > **Your apps**
5. Copy your Firebase configuration

6. Open `src/config.js` and replace the placeholder values:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const appId = 'your-app-id'; // Optional: customize your app ID
export const initialAuthToken = null; // Optional: for custom auth
```

### 3. Set Up Firestore Security Rules

In Firebase Console > Firestore Database > Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all public data
    match /artifacts/{appId}/public/data/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Note:** For production, implement stricter security rules based on your requirements.

### 4. Run the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Project Structure

```
ait-vote-2026/
├── src/
│   ├── App.jsx           # Main app wrapper
│   ├── VotingApp.jsx     # Main voting component
│   ├── main.jsx          # React entry point
│   ├── index.css         # Global styles + Tailwind
│   └── config.js         # Firebase configuration
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Dependencies

```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Firebase Data Structure

The app uses the following Firestore structure:

```
artifacts/
  └── {appId}/
      └── public/
          └── data/
              ├── candidates/
              │   └── {candidateId}/
              │       ├── id: string
              │       ├── name: string
              │       ├── gender: "male" | "female"
              │       ├── createdAt: timestamp
              │       └── nominator: userId
              └── votes/
                  └── {voteId}/
                      ├── candidateId: string
                      ├── userId: string
                      ├── gender: "male" | "female"
                      └── timestamp: timestamp
```

## Customization

- **App ID**: Change `appId` in `src/config.js` to use different Firestore collections
- **Styling**: Modify the `styles` constant in `VotingApp.jsx` for custom colors/effects
- **Background Image**: Update the background URL in the `.hk-bg` CSS class

## Troubleshooting

### Firebase Connection Issues
- Verify your Firebase config in `src/config.js`
- Check that Firestore is enabled in Firebase Console
- Ensure security rules allow read/write access

### Styling Issues
- Make sure Tailwind CSS is properly installed: `npm install -D tailwindcss postcss autoprefixer`
- Verify `tailwind.config.js` includes the correct content paths

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be v16+)

## License

ISC

