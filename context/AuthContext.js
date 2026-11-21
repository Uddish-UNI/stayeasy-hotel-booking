import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // useState is a memory slot that makes the screen redraw when it changes.
  // user starts as null (nobody known yet); initializing starts as true (awaiting for Firebase reply)
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Ask Firebase to tell us whenever the login changes: app open, login, register and logout.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);     // store the logged-in user (or null if nobody).
      setInitializing(false);    // Firebase has answered, so stop waiting
    });
    //Clean-up: stop listening when this component is removed to prevent memory being wasted and errors.
    return unsubscribe;
  }, []); // [] = this setup is run only once when component first appears.

  return (
    <AuthContext.Provider value={{ user, initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}