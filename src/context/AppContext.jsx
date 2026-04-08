import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { getUserProfile, saveUserProfile } from '../services/userService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Firebase auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        // First try local storage for speed
        const saved = localStorage.getItem('fc_user');
        let initialUser = null;
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.uid === firebaseUser.uid) {
            initialUser = parsed;
            setUser(parsed);
          }
        }

        // Always verify/refresh from Firestore
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            const updatedUser = {
              uid: firebaseUser.uid,
              name: profile.name || firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              photoURL: profile.photoURL || firebaseUser.photoURL,
              role: profile.role,
              id: `${profile.role}_${firebaseUser.uid}`
            };
            setUser(updatedUser);
            localStorage.setItem('fc_user', JSON.stringify(updatedUser));
          } else if (initialUser) {
            // Keep initial if profile fetch fails but we had it
            setUser(initialUser);
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
        }
      } else {
        setUser(null);
        localStorage.removeItem('fc_user');
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Cache user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('fc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fc_user');
    }
  }, [user]);

  // Google Sign-in
  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      return {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }, []);

  // Set role after Google sign-in (user can pick any role each time)
  const setUserRole = useCallback(async (googleUser, role) => {
    const userData = {
      uid: googleUser.uid,
      name: googleUser.name,
      email: googleUser.email,
      photoURL: googleUser.photoURL,
      role,
      id: `${role}_${googleUser.uid}`
    };

    // Save latest profile to Firestore
    await saveUserProfile(googleUser.uid, {
      name: googleUser.name,
      email: googleUser.email,
      photoURL: googleUser.photoURL,
      role,
      updatedAt: new Date().toISOString()
    });

    setUser(userData);
    addNotification('Welcome!', `Signed in as ${role}`);
  }, []);

  // Email/Password register
  const registerWithEmail = useCallback(async (email, password, name) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      return {
        uid: firebaseUser.uid,
        name: name,
        email: firebaseUser.email,
        photoURL: null
      };
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') throw new Error('Email already registered');
      throw error;
    }
  }, []);

  // Email/Password login
  const loginWithEmail = useCallback(async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      const profile = await getUserProfile(firebaseUser.uid);
      
      return {
        uid: firebaseUser.uid,
        name: profile?.name || firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        photoURL: profile?.photoURL || firebaseUser.photoURL || null,
        role: profile?.role || null // might be null if legacy user or just registered
      };
    } catch (error) {
      if (error.code === 'auth/invalid-credential') throw new Error('Invalid email or password');
      throw error;
    }
  }, []);

  // Admin login with email/password
  const loginAsAdmin = useCallback(async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      const profile = await getUserProfile(firebaseUser.uid);
      if (!profile || profile.role !== 'admin') {
        await signOut(auth);
        throw new Error('This account does not have admin access.');
      }

      const userData = {
        uid: firebaseUser.uid,
        name: profile.name || firebaseUser.displayName || 'Admin',
        email: firebaseUser.email,
        photoURL: profile.photoURL || null,
        role: 'admin',
        id: `admin_${firebaseUser.uid}`
      };

      setUser(userData);
      addNotification('Welcome Admin!', 'You have admin access');
      return userData;
    } catch (error) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password');
      }
      if (error.code === 'auth/user-not-found') {
        throw new Error('No admin account found with this email');
      }
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try { await signOut(auth); } catch (e) {}
    setUser(null);
    localStorage.removeItem('fc_user');
    setNotifications([]);
  }, []);

  const addToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  const addNotification = useCallback((title, message) => {
    setNotifications(prev => [{
      id: Date.now(), title, message, time: new Date(), read: false
    }, ...prev].slice(0, 20));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return (
    <AppContext.Provider value={{
      user, logout, loginWithGoogle, setUserRole, loginAsAdmin,
      loginWithEmail, registerWithEmail, authLoading,
      toasts, addToast, removeToast,
      notifications, addNotification, markAllNotificationsRead
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
