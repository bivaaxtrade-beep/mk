import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, onAuthStateChanged, onSnapshot, doc } from '../firebase';
import { User, getAuthUser } from '../lib/auth-client';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Initial set from local storage or firebase user
        const localUser = getAuthUser();
        setUser(localUser || { uid: firebaseUser.uid, email: firebaseUser.email });

        // Listen for real-time updates from Firestore
        unsubscribeSnapshot = onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setUser((prev: any) => ({ ...prev, ...data }));
            
            // Sync to local storage
            localStorage.setItem('bivax_user', JSON.stringify({ ...(getAuthUser() || {}), ...data }));
          }
        });
      } else {
        setUser(null);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
      }
      setLoading(false);
    });

    // Listen for auth change events from auth-client.ts
    const handleAuthChange = () => {
      const updatedUser = getAuthUser();
      setUser(updatedUser);
    };

    window.addEventListener('auth_change', handleAuthChange);

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      window.removeEventListener('auth_change', handleAuthChange);
    };
  }, []);

  const logout = async () => {
    await auth.signOut();
    localStorage.removeItem('bivax_token');
    localStorage.removeItem('bivax_user');
    setUser(null);
    window.dispatchEvent(new Event('auth_change'));
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
