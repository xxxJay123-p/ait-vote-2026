import React, { useState, useEffect, useRef } from 'react';
import { Users, Trophy, Plus, QrCode, Star, Sparkles, Music, Camera, Settings, Trash2, Clock, Lock } from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';

// --- Styles & Animation ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;500;700;900&family=Zen+Tokyo+Zoo&display=swap');

  :root {
    --neon-pink: #FF1D78;
    --neon-cyan: #00F0FF;
    --neon-orange: #FF6B00;
    --neon-red: #D40000;
    --bg-dark: #05040a;
  }

  body {
    background-color: var(--bg-dark);
    color: #eee;
    font-family: 'Noto Sans TC', sans-serif;
    overflow-x: hidden;
    margin: 0; /* Reset margin */
    -webkit-tap-highlight-color: transparent; /* Remove tap highlight on mobile */
  }

  /* --- Cinematic Background --- */
  .hk-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -2;
    background-color: #020205; /* Deep black-blue fallback */
    background-image: 
      /* Reduced opacity gradient (0.5 and 0.3) so image shows through */
      linear-gradient(to bottom, rgba(5,4,15,0.4) 0%, rgba(10,5,30,0.6) 100%),
      url('https://images.unsplash.com/photo-1543160408-54c7d9539d91?q=80&w=2532&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    background-blend-mode: overlay; /* Helps colors pop */
  }

  /* --- Film Grain & Scanlines --- */
  .film-grain {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
    opacity: 0.05;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  .scanlines {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 50;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%);
    background-size: 100% 4px;
    opacity: 0.4;
  }

  /* --- Neon Effects --- */
  .neon-text-pink {
    color: #fff;
    text-shadow: 
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 20px var(--neon-pink),
      0 0 30px var(--neon-pink),
      0 0 40px var(--neon-pink);
    animation: flicker 4s infinite alternate;
  }

  .neon-text-cyan {
    color: #fff;
    text-shadow: 
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 20px var(--neon-cyan),
      0 0 30px var(--neon-cyan),
      0 0 40px var(--neon-cyan);
  }

  .neon-text-orange {
    color: #fff;
    text-shadow: 
      0 0 5px #fff,
      0 0 10px var(--neon-orange),
      0 0 20px var(--neon-orange);
  }

  .neon-border-pink {
    box-shadow: 0 0 5px var(--neon-pink), inset 0 0 5px var(--neon-pink);
    border-color: var(--neon-pink);
  }

  .neon-border-cyan {
    box-shadow: 0 0 10px var(--neon-cyan), inset 0 0 5px rgba(0,240,255,0.2);
    border-color: var(--neon-cyan);
  }

  /* --- Glassmorphism --- */
  .glass-panel {
    background: rgba(16, 18, 27, 0.65); /* Slightly more transparent */
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.6);
  }

  .glass-input {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid #444;
    color: white;
    transition: all 0.3s ease;
  }
  .glass-input:focus {
    border-color: var(--neon-cyan);
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
    outline: none;
  }

  /* --- Animations --- */
  @keyframes flicker {
    0%, 18%, 22%, 25%, 53%, 57%, 100% {
      opacity: 1;
    }
    20%, 24%, 55% {
      opacity: 0.7;
    }
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
  }
  
  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  .animate-float {
    animation: float 4s ease-in-out infinite;
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }

  .btn-press {
    transition: transform 0.1s;
    min-height: 44px; /* Better touch target for mobile */
  }
  .btn-press:active {
    transform: scale(0.98);
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    /* Better text scaling */
    html {
      font-size: 14px;
    }
    
    /* Improve touch targets */
    button, input, select {
      min-height: 44px;
      font-size: 16px; /* Prevents zoom on iOS */
    }
    
    /* Better spacing on mobile */
    .mobile-padding {
      padding: 1rem;
    }
    
    /* Prevent text selection on buttons */
    button {
      -webkit-user-select: none;
      user-select: none;
    }
    
    /* Better scrolling on mobile */
    * {
      -webkit-overflow-scrolling: touch;
    }
  }
  
  /* Very small screens */
  @media (max-width: 375px) {
    html {
      font-size: 13px;
    }
  }
  
  /* HK Font Title */
  .hk-title-font {
    font-family: 'Zen Tokyo Zoo', cursive; 
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #050510; 
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #333; 
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--neon-cyan); 
  }
`;

// --- Main Component ---
const VotingApp = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [gender, setGender] = useState('male');
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState({});
  const [newCandidate, setNewCandidate] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [votingSettings, setVotingSettings] = useState({
    startTime: null,
    endTime: null,
    isActive: true
  });
  
  // Auth & Init - Generate local user ID
  useEffect(() => {
    const initAuth = () => {
      try {
        console.log("🔐 Initializing user...");
        
        // Generate or retrieve user ID from localStorage
        let userId = localStorage.getItem('userId');
        
        if (!userId) {
          // Generate a unique user ID
          userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('userId', userId);
          console.log("✅ New user created:", userId);
        } else {
          console.log("✅ Using existing user:", userId);
        }
        
        setUser({ uid: userId });
      } catch (err) {
        console.error("❌ Auth error:", err);
        setErrorMessage(`初始化用戶時發生錯誤: ${err.message}`);
        setTimeout(() => setErrorMessage(null), 5000);
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Load Data with Firebase real-time listeners
  useEffect(() => {
    if (!user) {
      console.log("⏳ Waiting for user authentication before loading data...");
      return;
    }

    console.log("📡 Setting up Firebase real-time listeners...");
    
    // Real-time listener for candidates
    // Try with orderBy first, fallback to simple query if it fails
    const candidatesRef = collection(db, 'candidates');
    let candidatesQuery;
    
    try {
      candidatesQuery = query(candidatesRef, orderBy('created_at', 'desc'));
    } catch (err) {
      console.warn("⚠️ Could not create ordered query, using simple query:", err);
      candidatesQuery = candidatesRef;
    }
    
    const unsubscribeCandidates = onSnapshot(
      candidatesQuery,
      (snapshot) => {
        const candidatesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort manually if orderBy failed
        candidatesData.sort((a, b) => {
          const aTime = a.created_at?.toMillis?.() || a.created_at || 0;
          const bTime = b.created_at?.toMillis?.() || b.created_at || 0;
          return bTime - aTime;
        });
        setCandidates(candidatesData);
        console.log(`✅ Loaded ${candidatesData.length} candidates from Firestore`);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error loading candidates:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        // If orderBy fails, try without it
        if (error.code === 'failed-precondition' || error.code === 'unavailable') {
          console.log("🔄 Retrying without orderBy...");
          const simpleQuery = collection(db, 'candidates');
          onSnapshot(simpleQuery, (snapshot) => {
            const candidatesData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setCandidates(candidatesData);
            console.log(`✅ Loaded ${candidatesData.length} candidates (simple query)`);
            setLoading(false);
          }, (retryError) => {
            console.error("❌ Retry also failed:", retryError);
            setErrorMessage(`載入候選人時發生錯誤: ${retryError.message}. 請確認 Firestore 已啟用且安全規則允許讀取。`);
            setTimeout(() => setErrorMessage(null), 5000);
            setLoading(false);
          });
        } else {
          setErrorMessage(`載入候選人時發生錯誤: ${error.message}. 請確認 Firestore 已啟用且安全規則允許讀取。`);
          setTimeout(() => setErrorMessage(null), 5000);
          setLoading(false);
        }
      }
    );

    // Real-time listener for votes
    const votesRef = collection(db, 'votes');
    const unsubscribeVotes = onSnapshot(
      votesRef,
      (snapshot) => {
        const votesData = snapshot.docs.map(doc => doc.data());
        
        // Calculate vote counts per candidate
        const voteMap = {};
        votesData.forEach(vote => {
          const candidateId = vote.candidate_id;
          voteMap[candidateId] = (voteMap[candidateId] || 0) + 1;
        });
        
        setVotes(voteMap);
        console.log(`✅ Updated vote stats: ${Object.keys(voteMap).length} candidates with votes`);
      },
      (error) => {
        console.error("❌ Error loading votes:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        setErrorMessage(`載入投票統計時發生錯誤: ${error.message}. 請確認 Firestore 已啟用且安全規則允許讀取。`);
        setTimeout(() => setErrorMessage(null), 5000);
      }
    );
    
    return () => {
      unsubscribeCandidates();
      unsubscribeVotes();
    };
  }, [user]);

  // Check if current user has voted for specific gender (real-time)
  const [hasVoted, setHasVoted] = useState({});
  
  useEffect(() => {
    if (!user) return;
    
    const votesRef = collection(db, 'votes');
    const voteQuery = query(
      votesRef, 
      where('user_id', '==', user.uid),
      where('gender', '==', gender)
    );
    
    const unsubscribe = onSnapshot(
      voteQuery,
      (snapshot) => {
        setHasVoted(prev => ({ ...prev, [gender]: !snapshot.empty }));
      },
      (error) => {
        console.error("Error checking vote:", error);
      }
    );
    
    return () => unsubscribe();
  }, [user, gender]);

  // Load voting settings from Firestore
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'voting');
    
    const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setVotingSettings({
          startTime: data.startTime?.toDate() || null,
          endTime: data.endTime?.toDate() || null,
          isActive: data.isActive !== false
        });
      } else {
        // Initialize default settings
        setDoc(settingsRef, {
          startTime: null,
          endTime: null,
          isActive: true
        });
      }
    }, (error) => {
      console.error("Error loading settings:", error);
    });

    return () => unsubscribe();
  }, []);

  // Check if voting is currently allowed
  const isVotingAllowed = () => {
    if (!votingSettings.isActive) return false;
    const now = new Date();
    if (votingSettings.startTime && now < votingSettings.startTime) return false;
    if (votingSettings.endTime && now > votingSettings.endTime) return false;
    return true;
  };
  
  const hasUserVoted = (genderToCheck) => {
    return hasVoted[genderToCheck] || false;
  };

  // Admin login
  const handleAdminLogin = () => {
    // Simple password check (you can change this password)
    const ADMIN_PASSWORD = 'admin2026';
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
      setSuccessMessage('管理員登入成功！');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage('密碼錯誤！');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  // Update voting settings
  const updateVotingSettings = async (newSettings) => {
    try {
      const settingsRef = doc(db, 'settings', 'voting');
      const updateData = {
        ...newSettings,
        updatedAt: serverTimestamp()
      };
      // Convert Date objects to Firestore Timestamp
      if (updateData.startTime) {
        updateData.startTime = updateData.startTime instanceof Date ? updateData.startTime : null;
      }
      if (updateData.endTime) {
        updateData.endTime = updateData.endTime instanceof Date ? updateData.endTime : null;
      }
      await updateDoc(settingsRef, updateData);
      setSuccessMessage('設定已更新！');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error updating settings:", err);
      setErrorMessage(`更新設定失敗: ${err.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Reset all votes
  const resetAllVotes = async () => {
    if (!window.confirm('確定要重置所有投票嗎？此操作無法復原！')) return;
    
    try {
      const votesRef = collection(db, 'votes');
      const votesSnapshot = await getDocs(votesRef);
      
      const batch = writeBatch(db);
      votesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      setSuccessMessage('所有投票已重置！');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error resetting votes:", err);
      setErrorMessage(`重置投票失敗: ${err.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Clear all data (candidates and votes)
  const clearAllData = async () => {
    if (!window.confirm('確定要清除所有資料（候選人和投票）嗎？此操作無法復原！')) return;
    
    try {
      // Delete all votes
      const votesRef = collection(db, 'votes');
      const votesSnapshot = await getDocs(votesRef);
      const votesBatch = writeBatch(db);
      votesSnapshot.docs.forEach((doc) => {
        votesBatch.delete(doc.ref);
      });
      await votesBatch.commit();

      // Delete all candidates
      const candidatesRef = collection(db, 'candidates');
      const candidatesSnapshot = await getDocs(candidatesRef);
      const candidatesBatch = writeBatch(db);
      candidatesSnapshot.docs.forEach((doc) => {
        candidatesBatch.delete(doc.ref);
      });
      await candidatesBatch.commit();

      setSuccessMessage('所有資料已清除！');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error clearing data:", err);
      setErrorMessage(`清除資料失敗: ${err.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const addCandidate = async () => {
    if (!newCandidate.trim() || !user) return;
    
    // Check if voting is allowed
    if (!isVotingAllowed() && !isAdmin) {
      setErrorMessage('目前不在投票時間內！');
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }
    
    const name = newCandidate.trim();
    const nameLower = name.toLowerCase();
    
    // Clear previous messages
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      // Check if candidate with same name (case-insensitive) and gender already exists
      // Get all candidates of the same gender and check in client-side for case-insensitive match
      const candidatesRef = collection(db, 'candidates');
      const checkQuery = query(
        candidatesRef,
        where('gender', '==', gender)
      );
      const checkSnapshot = await getDocs(checkQuery);
      
      // Check for case-insensitive duplicate
      const duplicate = checkSnapshot.docs.find(doc => {
        const existingName = doc.data().name;
        return existingName && existingName.toLowerCase() === nameLower;
      });
      
      if (duplicate) {
        const existingName = duplicate.data().name;
        setErrorMessage(`候選人 "${existingName}" 已經存在於 ${gender === 'male' ? 'Gentlemen' : 'Ladies'} 組別中！（不區分大小寫）`);
        setTimeout(() => setErrorMessage(null), 5000);
        return;
      }
      
      // Add candidate if not duplicate
      setNewCandidate('');
      const docRef = await addDoc(candidatesRef, {
        name: name,
        gender: gender,
        nominator: user.uid,
        created_at: serverTimestamp()
      });
      console.log("✅ Candidate added successfully to Firestore with ID:", docRef.id);
      setSuccessMessage(`候選人 "${name}" 已成功添加！`);
      setTimeout(() => setSuccessMessage(null), 3000);
      // Real-time listener will automatically update the list
    } catch (err) {
      console.error("❌ Error adding candidate:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      setErrorMessage(`無法添加候選人: ${err.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const vote = async (candidateId) => {
    // Clear previous messages
    setErrorMessage(null);
    setSuccessMessage(null);
    
    // Check if voting is allowed
    if (!isVotingAllowed() && !isAdmin) {
      setErrorMessage('目前不在投票時間內！');
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }
    
    if (!user) {
      setErrorMessage('請先初始化用戶！');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    // First check: UI state check
    if (hasUserVoted(gender)) {
      setErrorMessage(`您已經為 ${gender === 'male' ? 'Gentlemen' : 'Ladies'} 組別投票了！每個用戶只能為每個性別組別投票一次。`);
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    try {
      // Second check: Database check (more reliable)
      const votesRef = collection(db, 'votes');
      const checkQuery = query(
        votesRef,
        where('user_id', '==', user.uid),
        where('gender', '==', gender)
      );
      const checkSnapshot = await getDocs(checkQuery);
      
      if (!checkSnapshot.empty) {
        setErrorMessage(`您已經為 ${gender === 'male' ? 'Gentlemen' : 'Ladies'} 組別投票了！每個用戶只能為每個性別組別投票一次。`);
        setTimeout(() => setErrorMessage(null), 5000);
        // Update local state to reflect database state
        setHasVoted(prev => ({ ...prev, [gender]: true }));
        return;
      }
      
      // Find candidate name for success message
      const candidate = candidates.find(c => c.id === candidateId);
      const candidateName = candidate ? candidate.name : '候選人';
      
      // Add the vote
      const voteRef = await addDoc(votesRef, {
        candidate_id: candidateId,
        user_id: user.uid,
        gender: gender,
        timestamp: serverTimestamp()
      });
      
      console.log("✅ Vote recorded successfully in Firestore with ID:", voteRef.id);
      // Update local state immediately
      setHasVoted(prev => ({ ...prev, [gender]: true }));
      setSuccessMessage(`投票成功！您已為 ${candidateName} 投票。`);
      setTimeout(() => setSuccessMessage(null), 3000);
      // Real-time listener will automatically update vote counts
    } catch (err) {
      console.error("❌ Error voting:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      setErrorMessage(`投票失敗: ${err.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const getFilteredCandidates = () => {
    return candidates
      .filter(c => c.gender === gender)
      .sort((a, b) => (votes[a.id] || 0) - (votes[b.id] || 0))
      .reverse(); // Highest votes first
  };

  const currentUrl = window.location.href;

  return (
    <>
      <style>{styles}</style>
      <div className="hk-bg" />
      <div className="film-grain" />
      <div className="scanlines" />

      {/* Main Layout */}
      <div className="min-h-screen relative z-10 flex flex-col items-center p-3 sm:p-4 md:p-8">
        
        {/* Header Section */}
        <header className="w-full max-w-4xl mb-4 sm:mb-6 md:mb-8 mt-2 sm:mt-4 text-center relative group">
           {/* Top "Neon Sign" Container */}
           <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-xl border border-pink-500/30 relative overflow-hidden">
             {/* Decorative Chinese text top corners */}
             <div className="absolute top-1 left-2 sm:top-2 sm:left-3 text-[10px] sm:text-xs text-cyan-400 opacity-60 tracking-[0.1em] sm:tracking-[0.2em]">香港 • HONG KONG</div>
             <div className="absolute top-1 right-2 sm:top-2 sm:right-3 text-[10px] sm:text-xs text-pink-400 opacity-60 tracking-[0.1em] sm:tracking-[0.2em]">1984</div>

             <div className="relative z-10 flex flex-col items-center">
               <div className="flex items-center gap-1 sm:gap-2 md:gap-3 mb-1 sm:mb-2 animate-float">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                  <span className="text-yellow-400 font-bold tracking-wider sm:tracking-widest text-[10px] sm:text-xs md:text-sm drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">
                    AIT ANNUAL DINNER 2026 VOTING
                  </span>
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
               </div>
               
               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-1 sm:mb-2 hk-title-font neon-text-pink leading-tight px-2">
                 年度晚宴
               </h1>
               <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold uppercase tracking-tighter neon-text-cyan flex items-center justify-center gap-2 sm:gap-4 px-2">
                 <span className="hidden sm:inline-block w-8 sm:w-12 h-1 bg-cyan-400 shadow-[0_0_10px_#00F0FF]"></span>
                 最佳服裝獎
                 <span className="hidden sm:inline-block w-8 sm:w-12 h-1 bg-cyan-400 shadow-[0_0_10px_#00F0FF]"></span>
               </h2>
             </div>

             {/* Background glow blob */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-pink-600/20 rounded-full blur-[40px] sm:blur-[50px] md:blur-[60px] pointer-events-none"></div>
           </div>
        </header>

        {/* Navigation Tabs (Neon Tubes) */}
        <div className="w-full max-w-4xl flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
            <button
              onClick={() => setView('home')}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold text-base sm:text-lg md:text-xl tracking-wider transition-all duration-300 btn-press border uppercase flex items-center justify-center gap-2 ${
                view === 'home' 
                  ? 'bg-black/40 border-cyan-400 neon-border-cyan text-cyan-50' 
                  : 'bg-black/20 border-white/10 text-gray-400 hover:text-white hover:border-white/30 active:bg-black/30'
              }`}
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Vote / Nominate</span>
              <span className="sm:hidden">Vote</span>
            </button>
            
            <button
              onClick={() => setView('leaderboard')}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold text-base sm:text-lg md:text-xl tracking-wider transition-all duration-300 btn-press border uppercase flex items-center justify-center gap-2 ${
                view === 'leaderboard' 
                  ? 'bg-black/40 border-pink-500 neon-border-pink text-pink-50' 
                  : 'bg-black/20 border-white/10 text-gray-400 hover:text-white hover:border-white/30 active:bg-black/30'
              }`}
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Live Rankings</span>
              <span className="sm:hidden">Rankings</span>
            </button>

             <button
              onClick={() => setShowQR(!showQR)}
              className={`py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold transition-all duration-300 btn-press border flex items-center justify-center min-w-[60px] sm:min-w-[80px] ${
                showQR 
                  ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' 
                  : 'bg-black/20 border-white/10 text-gray-400 hover:text-yellow-200 hover:border-yellow-400/50 active:bg-black/30'
              }`}
            >
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {isAdmin && (
              <button
                onClick={() => setView('admin')}
                className={`py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold text-base sm:text-lg md:text-xl tracking-wider transition-all duration-300 btn-press border uppercase flex items-center justify-center gap-2 ${
                  view === 'admin' 
                    ? 'bg-black/40 border-orange-500 neon-border-pink text-orange-50' 
                    : 'bg-black/20 border-white/10 text-gray-400 hover:text-orange-200 hover:border-orange-400/50 active:bg-black/30'
                }`}
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {!isAdmin && (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold transition-all duration-300 btn-press border bg-black/20 border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/30 active:bg-black/30 flex items-center justify-center min-w-[60px] sm:min-w-[80px]"
                title="Admin Login"
              >
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
        </div>

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowAdminLogin(false)}>
            <div className="glass-panel p-6 sm:p-8 rounded-2xl max-w-md w-full text-center border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.2)] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="text-orange-400 text-xl sm:text-2xl font-bold mb-4 tracking-widest flex items-center justify-center gap-2">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                Admin Login
              </div>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="Enter admin password"
                className="w-full glass-input px-4 py-3 rounded text-base sm:text-lg placeholder-gray-500 mb-4"
                autoFocus
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAdminLogin}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] active:scale-95"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword('');
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold uppercase tracking-wider transition active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Modal Overlay */}
        {showQR && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowQR(false)}>
             <div className="glass-panel p-6 sm:p-8 rounded-2xl max-w-sm w-full text-center border-yellow-500/50 shadow-[0_0_30px_rgba(250,204,21,0.2)] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
               <div className="text-yellow-400 text-xl sm:text-2xl font-bold mb-4 tracking-widest neon-text-orange">SCAN TO VOTE</div>
               <div className="bg-white p-3 sm:p-4 rounded-lg inline-block mb-4 shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`}
                   alt="QR"
                   className="w-40 h-40 sm:w-48 sm:h-48 mix-blend-multiply"
                 />
               </div>
               <p className="text-xs text-gray-400 font-mono break-all px-2 mb-4">{currentUrl}</p>
               <button onClick={() => setShowQR(false)} className="w-full py-3 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/50 text-yellow-300 rounded uppercase tracking-wider font-bold transition active:scale-95">Close</button>
             </div>
           </div>
        )}

        {/* Gender Toggle Switch */}
        <div className="w-full max-w-4xl glass-panel p-1.5 sm:p-2 rounded-xl flex mb-4 sm:mb-6 md:mb-8 relative">
           <div 
             className={`absolute top-1.5 sm:top-2 bottom-1.5 sm:bottom-2 w-[calc(50%-6px)] sm:w-[calc(50%-8px)] bg-gradient-to-r transition-all duration-500 rounded-lg shadow-lg z-0 ${
               gender === 'male' 
               ? 'left-1.5 sm:left-2 from-blue-900 to-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
               : 'left-[calc(50%+3px)] sm:left-[calc(50%+4px)] from-pink-900 to-pink-600 shadow-[0_0_20px_rgba(219,39,119,0.4)]'
             }`}
           />
           
           <button
             onClick={() => setGender('male')}
             className={`flex-1 relative z-10 py-2.5 sm:py-3 text-center font-black text-base sm:text-lg md:text-2xl uppercase tracking-wide sm:tracking-widest transition-colors active:opacity-80 ${
               gender === 'male' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
             }`}
           >
             <span className="drop-shadow-md">Gentlemen 紳士</span>
           </button>
           <button
             onClick={() => setGender('female')}
             className={`flex-1 relative z-10 py-2.5 sm:py-3 text-center font-black text-base sm:text-lg md:text-2xl uppercase tracking-wide sm:tracking-widest transition-colors active:opacity-80 ${
               gender === 'female' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
             }`}
           >
             <span className="drop-shadow-md">Ladies 淑女</span>
           </button>
        </div>

        {/* Message Display Area */}
        {(errorMessage || successMessage) && (
          <div className="w-full max-w-4xl mb-3 sm:mb-4">
            {errorMessage && (
              <div className="glass-panel p-3 sm:p-4 rounded-xl border-l-4 border-l-red-500 bg-red-500/10 animate-fade-in">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse flex-shrink-0"></div>
                  <span className="text-red-300 font-medium text-sm sm:text-base break-words flex-1">{errorMessage}</span>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="ml-auto text-red-400 hover:text-red-300 text-xl sm:text-2xl font-bold flex-shrink-0 min-w-[24px] min-h-[24px] flex items-center justify-center"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            {successMessage && (
              <div className="glass-panel p-3 sm:p-4 rounded-xl border-l-4 border-l-green-500 bg-green-500/10 animate-fade-in">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
                  <span className="text-green-300 font-medium text-sm sm:text-base break-words flex-1">{successMessage}</span>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="ml-auto text-green-400 hover:text-green-300 text-xl sm:text-2xl font-bold flex-shrink-0 min-w-[24px] min-h-[24px] flex items-center justify-center"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONTENT AREA */}
        <div className="w-full max-w-4xl">
          {view === 'home' && (
            <div className="flex flex-col gap-6">
              
              {/* Nomination Input */}
              <div className="glass-panel p-4 sm:p-6 rounded-xl border-l-4 border-l-pink-500">
                <h3 className="text-lg sm:text-xl font-bold text-pink-400 mb-3 sm:mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Nominate Candidate
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={newCandidate}
                    onChange={(e) => setNewCandidate(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCandidate()}
                    placeholder={gender === 'male' ? "Enter gentleman's name..." : "Enter lady's name..."}
                    className="flex-1 glass-input px-4 py-3 sm:py-4 rounded text-base sm:text-lg placeholder-gray-500"
                  />
                  <button
                    onClick={addCandidate}
                    disabled={!newCandidate.trim()}
                    className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-3 sm:py-4 rounded font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] active:scale-95"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Voting List */}
              <div className="glass-panel p-4 sm:p-6 rounded-xl min-h-[300px] sm:min-h-[400px]">
                 <h3 className="text-lg sm:text-xl font-bold text-cyan-400 mb-4 sm:mb-6 flex items-center gap-2 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  Cast Your Vote
                </h3>

                {hasUserVoted(gender) && (
                  <div className="mb-4 sm:mb-6 bg-green-500/20 border border-green-500/50 p-3 sm:p-4 rounded text-green-300 flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_15px_rgba(34,197,94,0.2)] text-sm sm:text-base">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
                    <span>Vote Confirmed • 投票已確認</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {loading ? (
                    <div className="col-span-full py-8 sm:py-12 text-center text-gray-500 animate-pulse text-sm sm:text-base">Loading neon database...</div>
                  ) : getFilteredCandidates().length === 0 ? (
                    <div className="col-span-full py-8 sm:py-12 text-center border-2 border-dashed border-gray-700 rounded-xl text-gray-500 flex flex-col items-center px-4">
                      <Users className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 opacity-20" />
                      <span className="text-sm sm:text-base">No candidates yet. Be the first to nominate!</span>
                    </div>
                  ) : (
                    getFilteredCandidates().map((candidate) => (
                      <button
                        key={candidate.id}
                        onClick={() => vote(candidate.id)}
                        disabled={hasUserVoted(gender)}
                        className={`group relative p-4 sm:p-5 rounded-lg border transition-all duration-300 text-left overflow-hidden active:scale-[0.98] ${
                          hasUserVoted(gender)
                            ? 'bg-black/40 border-gray-800 opacity-50 cursor-default'
                            : 'bg-black/40 border-gray-700 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] active:bg-black/50'
                        }`}
                      >
                         {/* Hover gradient background */}
                         {!hasUserVoted(gender) && (
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/0 via-cyan-900/10 to-cyan-900/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                         )}

                         <div className="flex justify-between items-center relative z-10 gap-2">
                           <span className={`font-bold text-lg sm:text-xl tracking-wide group-hover:text-cyan-300 transition-colors break-words flex-1 ${hasUserVoted(gender) ? 'text-gray-500' : 'text-gray-200'}`}>
                             {candidate.name}
                           </span>
                           <span className="text-[10px] sm:text-xs text-gray-600 font-mono tracking-widest uppercase flex-shrink-0">ID:{candidate.id.slice(-4)}</span>
                         </div>
                         
                         {/* Vote Count Badge */}
                         <div className="mt-2 sm:mt-3 flex items-center justify-between gap-2">
                            <div className="h-1 flex-1 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-cyan-500 shadow-[0_0_10px_#00F0FF]"
                                  style={{ 
                                    width: `${Math.min(((votes[candidate.id] || 0) / (Object.values(votes).reduce((a,b)=>a+b,0)||1)) * 100, 100)}%` 
                                  }} 
                                />
                            </div>
                            <span className="text-cyan-500 font-mono text-xs sm:text-sm flex-shrink-0 ml-2">{votes[candidate.id] || 0} PTS</span>
                         </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
          {view === 'leaderboard' && (
            /* LEADERBOARD VIEW */
            <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-xl border-t-4 border-t-yellow-500 min-h-[400px] sm:min-h-[600px]">
               <h3 className="text-2xl sm:text-3xl font-black text-center mb-6 sm:mb-10 uppercase tracking-widest neon-text-orange flex justify-center items-center gap-2 sm:gap-4">
                 <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                 Ranking Board
                 <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
               </h3>

               <div className="space-y-4 sm:space-y-6">
                 {getFilteredCandidates().length === 0 ? (
                    <div className="text-center text-gray-500 py-8 sm:py-10 text-sm sm:text-base">Waiting for data stream...</div>
                 ) : (
                   getFilteredCandidates().map((candidate, index) => {
                     const voteCount = votes[candidate.id] || 0;
                     const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
                     const maxVote = Math.max(...getFilteredCandidates().map(c => votes[c.id] || 0));
                     const barWidth = maxVote > 0 ? (voteCount / maxVote) * 100 : 0;

                     return (
                       <div key={candidate.id} className="relative">
                         {/* Rank Number */}
                         <div className="absolute -left-3 sm:-left-4 -top-2 sm:-top-3 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-black text-lg sm:text-xl italic z-20"
                              style={{ 
                                color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#555',
                                textShadow: index < 3 ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                              }}>
                           {index + 1}
                         </div>

                         <div className={`
                            relative p-3 sm:p-4 pl-6 sm:pl-8 rounded border-r-4 transition-all duration-500
                            ${index === 0 ? 'bg-gradient-to-r from-yellow-900/40 to-black border-yellow-500' : 
                              index === 1 ? 'bg-gradient-to-r from-gray-800/40 to-black border-gray-400' :
                              index === 2 ? 'bg-gradient-to-r from-orange-900/40 to-black border-orange-600' :
                              'bg-black/40 border-gray-800'
                            }
                         `}>
                            <div className="flex justify-between items-end mb-2 relative z-10 gap-2">
                              <span className={`text-lg sm:text-xl font-bold tracking-wider break-words flex-1 ${index === 0 ? 'text-yellow-100' : 'text-gray-300'}`}>
                                {candidate.name}
                              </span>
                              <span className="font-mono text-xl sm:text-2xl font-bold neon-text-pink flex-shrink-0">
                                {voteCount}
                              </span>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="h-1.5 sm:h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-out`}
                                  style={{ 
                                    width: `${barWidth}%`,
                                    backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#FF1D78',
                                    color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#FF1D78'
                                  }}
                                />
                            </div>
                         </div>
                       </div>
                     );
                   })
                 )}
               </div>

               {/* Footer Stats */}
               <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between gap-2 text-[10px] sm:text-xs font-mono text-gray-500 uppercase tracking-widest">
                 <span>System: Online</span>
                 <span>Loc: Tsim Sha Tsui / HK</span>
               </div>
            </div>
          )}
          {view === 'admin' && (
            /* ADMIN PANEL */
            <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-xl border-t-4 border-t-orange-500 min-h-[400px] sm:min-h-[600px]">
              <h3 className="text-2xl sm:text-3xl font-black text-center mb-6 sm:mb-10 uppercase tracking-widest text-orange-400 flex justify-center items-center gap-2 sm:gap-4">
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                Admin Control Panel
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
              </h3>

              <div className="space-y-4 sm:space-y-6">
                {/* Voting Status */}
                <div className="glass-panel p-4 sm:p-6 rounded-xl border-l-4 border-l-cyan-500">
                  <h4 className="text-lg sm:text-xl font-bold text-cyan-400 mb-3 sm:mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    Voting Status
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-gray-300 text-sm sm:text-base">Status:</span>
                      <span className={`font-bold text-sm sm:text-base ${isVotingAllowed() ? 'text-green-400' : 'text-red-400'}`}>
                        {isVotingAllowed() ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-gray-300 text-sm sm:text-base">Start Time:</span>
                      <span className="text-gray-200 font-mono text-xs sm:text-sm break-all">
                        {votingSettings.startTime 
                          ? votingSettings.startTime.toLocaleString('zh-TW')
                          : 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-gray-300 text-sm sm:text-base">End Time:</span>
                      <span className="text-gray-200 font-mono text-xs sm:text-sm break-all">
                        {votingSettings.endTime 
                          ? votingSettings.endTime.toLocaleString('zh-TW')
                          : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Time Control */}
                <div className="glass-panel p-4 sm:p-6 rounded-xl border-l-4 border-l-blue-500">
                  <h4 className="text-lg sm:text-xl font-bold text-blue-400 mb-3 sm:mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    Time Control
                  </h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm sm:text-base">Start Time:</label>
                      <input
                        type="datetime-local"
                        value={votingSettings.startTime 
                          ? new Date(votingSettings.startTime.getTime() - votingSettings.startTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                          : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          updateVotingSettings({ startTime: date });
                        }}
                        className="w-full glass-input px-4 py-2 rounded text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm sm:text-base">End Time:</label>
                      <input
                        type="datetime-local"
                        value={votingSettings.endTime 
                          ? new Date(votingSettings.endTime.getTime() - votingSettings.endTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                          : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          updateVotingSettings({ endTime: date });
                        }}
                        className="w-full glass-input px-4 py-2 rounded text-base"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={() => updateVotingSettings({ isActive: true })}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold uppercase tracking-wider transition active:scale-95"
                      >
                        Enable Voting
                      </button>
                      <button
                        onClick={() => updateVotingSettings({ isActive: false })}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold uppercase tracking-wider transition active:scale-95"
                      >
                        Disable Voting
                      </button>
                    </div>
                    <button
                      onClick={() => updateVotingSettings({ startTime: null, endTime: null })}
                      className="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded font-bold uppercase tracking-wider transition active:scale-95"
                    >
                      Clear Time Limits
                    </button>
                  </div>
                </div>

                {/* Data Management */}
                <div className="glass-panel p-4 sm:p-6 rounded-xl border-l-4 border-l-red-500">
                  <h4 className="text-lg sm:text-xl font-bold text-red-400 mb-3 sm:mb-4 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Data Management
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    <button
                      onClick={resetAllVotes}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-3 rounded font-bold uppercase tracking-wider transition shadow-[0_0_15px_rgba(249,115,22,0.4)] active:scale-95"
                    >
                      Reset All Votes
                    </button>
                    <button
                      onClick={clearAllData}
                      className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded font-bold uppercase tracking-wider transition shadow-[0_0_15px_rgba(220,38,38,0.4)] active:scale-95"
                    >
                      Clear All Data (Candidates + Votes)
                    </button>
                  </div>
                </div>

                {/* Logout */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      setIsAdmin(false);
                      setSuccessMessage('已登出管理員');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded font-bold uppercase tracking-wider transition active:scale-95"
                  >
                    Logout Admin
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VotingApp;