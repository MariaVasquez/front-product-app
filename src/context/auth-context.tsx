import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { UserResponse } from '../models/user.model';
import { useLocalStorage } from '../hooks/use-local-storage';


interface AuthContextProps {
  user: UserResponse | null;
  setUser: (user: UserResponse | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useLocalStorage<UserResponse | null>('user', null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};