
import React, { createContext, useContext, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Voter } from '../types';

type User = 'admin' | string | null;
type View = 'landing' | 'login';

interface AuthContextType {
  user: User;
  view: View;
  login: (type: 'admin' | 'voter', credentials: { username?: string; password?: string; uid?: string }) => boolean;
  logout: () => void;
  showLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [view, setView] = useState<View>('landing');
  const [voterData] = useLocalStorage<Voter[]>('voterData', []);

  const login = (type: 'admin' | 'voter', credentials: { username?: string; password?: string; uid?: string }): boolean => {
    if (type === 'admin') {
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        setUser('admin');
        return true;
      }
    } else if (type === 'voter') {
      const voter = voterData.find(v => v.uid === credentials.uid?.trim().toUpperCase());
      if (voter) {
        setUser(voter.uid);
        sessionStorage.setItem('voterID', voter.uid);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('voterID');
    setView('landing');
  };

  const showLogin = () => {
    setView('login');
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, view, showLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
