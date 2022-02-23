import {useContext, useState, createContext} from 'react';
import {auth} from 'lib/auth';
import {User} from 'firebase/auth';

interface AuthProps {
  children: React.ReactNode;
}

interface AuthContextInterface {
  user: User | null;
}

const AuthContext = createContext<AuthContextInterface | null>(null);

export function AuthProvider({children}: AuthProps) {
  const [user, setUser] = useState(auth.currentUser);
  auth.onAuthStateChanged(user => setUser(user));

  return (
    <AuthContext.Provider
      value={{
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) throw new Error('useAuth must be used inside a `AuthProvider`');

  return context;
}
