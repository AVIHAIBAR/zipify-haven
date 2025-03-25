import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextProps {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialUser = null }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  
  // Mock authentication functions
  const login = async (email: string, password: string): Promise<User> => {
    // In a real app, this would make an API call to authenticate
    const user: User = {
      id: 'user-123',
      name: 'Demo User',
      email
    };
    
    setCurrentUser(user);
    return user;
  };
  
  const register = async (name: string, email: string, password: string): Promise<User> => {
    // In a real app, this would make an API call to register
    const user: User = {
      id: 'user-123',
      name,
      email
    };
    
    setCurrentUser(user);
    return user;
  };
  
  const logout = async (): Promise<void> => {
    // In a real app, this would make an API call to logout
    setCurrentUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
