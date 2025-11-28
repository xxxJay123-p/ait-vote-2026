# AIT Annual Dinner 2026 - Best Costume Award Voting App

A beautiful, cinematic voting application with Hong Kong-inspired neon aesthetics, real-time Firebase integration, and responsive design for mobile and desktop devices.

![Voting App](https://img.shields.io/badge/React-18.2.0-blue) ![Firebase](https://img.shields.io/badge/Firebase-12.6.0-orange) ![Vite](https://img.shields.io/badge/Vite-5.0.8-purple)

## ✨ Features

### Core Functionality
- 🎨 **Cinematic Design** - Hong Kong-inspired neon aesthetic with glassmorphism UI
- 🔥 **Real-time Voting** - Live updates using Firebase Firestore
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop
- 🎭 **Gender Categories** - Separate voting for Gentlemen (紳士) and Ladies (淑女)
- 📊 **Live Leaderboard** - Real-time rankings with podium display for top 3
- 🏆 **Podium Rankings** - Dynamic animated podium for winners with glow effects
- 📱 **QR Code Sharing** - Generate QR codes for easy access
- 👤 **User Management** - Automatic user ID generation and vote tracking

### Admin Features
- 🔐 **Admin Panel** - Password-protected admin access
- ⏰ **Time Controls** - Set voting start/end times
- 🔄 **Vote Management** - Reset votes or clear all data
- 📈 **Statistics** - View voting status and timestamps

### UI/UX Enhancements
- ✨ **Neon Effects** - Glowing text and borders with flicker animations
- 🎬 **Film Grain** - Retro cinematic effects
- 🌈 **Dynamic Backgrounds** - Different images for mobile and desktop
- 💫 **Smooth Animations** - Floating, fade-in, and shimmer effects
- 🎯 **Touch Optimized** - 44px minimum touch targets for mobile

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Firebase Project** with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ait-vote-2026
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Copy the example environment file and fill in your Firebase credentials:
   
   ```bash
   cp .env.example .env
   ```
   
   Open `.env` and update with your Firebase configuration:
   
   ```env
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   VITE_ADMIN_PASSWORD=admin2026
   ```
   
   **Get these values from**: Firebase Console > Project Settings > General > Your apps
   
   ⚠️ **Important**: Never commit the `.env` file to version control. It's already in `.gitignore`.

4. **Set Up Firestore Security Rules**
   
   In Firebase Console > Firestore Database > Rules:
   
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read/write for development (update for production)
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   
   ⚠️ **Important**: For production, implement proper authentication and security rules.

5. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The app will open at `http://localhost:3000`

## 📁 Project Structure

```
ait-vote-2026/
├── src/
│   ├── App.jsx                    # Main app wrapper
│   ├── VotingApp.jsx             # Main voting component (all features)
│   ├── main.jsx                   # React entry point
│   ├── index.css                 # Global styles + Tailwind
│   ├── firebase.js                # Firebase configuration
│   ├── config.js                  # Legacy config (unused)
│   └── assets/
│       ├── Desktop_background.png # Desktop background image
│       └── Mobile_background.png  # Mobile background image
├── public/                        # Static assets (served at root)
│   └── Gemini_Generated_Image_*.png
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
└── package.json                   # Dependencies
```

## 🎮 Usage

### For Voters

1. **Select Category** - Choose between "Gentlemen 紳士" or "Ladies 淑女"
2. **Nominate** - Enter a candidate's name and click "Add"
3. **Vote** - Click on a candidate card to cast your vote
4. **View Rankings** - Switch to "Live Rankings" tab to see the leaderboard
5. **Share** - Click the QR code icon to generate a shareable QR code

### For Administrators

1. **Login** - Click the lock icon and enter admin password (default: `admin2026`)
2. **Access Admin Panel** - Click the "Admin" tab
3. **Manage Voting**:
   - Set start/end times for voting
   - Enable/disable voting
   - View current voting status
4. **Data Management**:
   - Reset all votes
   - Clear all data (candidates + votes)

## 🗄️ Firebase Data Structure

The app uses the following Firestore collections:

```
candidates/
  └── {candidateId}/
      ├── name: string
      ├── gender: "male" | "female"
      ├── nominator: string (userId)
      └── created_at: timestamp

votes/
  └── {voteId}/
      ├── candidate_id: string
      ├── user_id: string
      ├── gender: "male" | "female"
      └── timestamp: timestamp

settings/
  └── voting/
      ├── startTime: timestamp (nullable)
      ├── endTime: timestamp (nullable)
      ├── isActive: boolean
      └── updatedAt: timestamp
```

## 🎨 Customization

### Background Images

- **Desktop**: `src/assets/Desktop_background.png`
- **Mobile**: `src/assets/Mobile_background.png`
- The app automatically switches based on screen width (≤768px = mobile)

### Colors & Styling

Edit the CSS variables in `VotingApp.jsx`:

```javascript
:root {
  --neon-pink: #FF1D78;
  --neon-cyan: #00F0FF;
  --neon-orange: #FF6B00;
  --neon-red: #D40000;
  --bg-dark: #05040a;
}
```

### Admin Password

Change the admin password in `.env` file:

```env
VITE_ADMIN_PASSWORD=your-new-password
```

After changing, restart the development server for changes to take effect.

## 📱 Responsive Breakpoints

- **Mobile**: ≤ 768px (uses mobile background)
- **Tablet**: 769px - 1024px
- **Desktop**: > 1024px (uses desktop background)

## 🛠️ Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🐛 Troubleshooting

### Firebase Connection Issues

- ✅ Verify Firebase config in `src/firebase.js`
- ✅ Check that Firestore is enabled in Firebase Console
- ✅ Ensure security rules allow read/write access
- ✅ Check browser console for error messages

### Image Not Displaying

- ✅ Verify images exist in `src/assets/` folder
- ✅ Check browser console for import errors
- ✅ Clear browser cache and restart dev server
- ✅ Ensure image file names match exactly (case-sensitive)

### Styling Issues

- ✅ Install Tailwind: `npm install -D tailwindcss postcss autoprefixer`
- ✅ Verify `tailwind.config.js` includes correct content paths
- ✅ Check that `index.css` imports Tailwind directives

### Build Errors

- ✅ Clear dependencies: `rm -rf node_modules && npm install`
- ✅ Check Node.js version: `node --version` (should be v16+)
- ✅ Verify all imports are correct
- ✅ Check for TypeScript errors if using TypeScript

### Voting Not Working

- ✅ Check Firebase connection
- ✅ Verify Firestore security rules
- ✅ Check browser console for errors
- ✅ Ensure user ID is generated (check localStorage)

## 🔒 Security Notes

⚠️ **Important for Production**:

1. **Environment Variables**: 
   - Never commit `.env` file to version control (already in `.gitignore`)
   - Use different `.env` files for development and production
   - Set environment variables in your hosting platform (Vercel, Netlify, etc.)

2. **Firebase Security Rules**: Implement proper authentication-based rules

3. **Admin Password**: 
   - Change default password in `.env` file
   - Consider implementing proper authentication system
   - Use strong passwords for production

4. **API Keys**: 
   - All sensitive keys are now in `.env` file
   - Never expose Firebase keys in client-side code comments

5. **Rate Limiting**: Consider implementing vote rate limiting

6. **Input Validation**: Add server-side validation for candidate names

## 📝 License

ISC

## 🙏 Acknowledgments

- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Firebase](https://firebase.google.com/)

---

**Made with ❤️ for AIT Annual Dinner 2026**
