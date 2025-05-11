import React, { createContext, useState } from 'react';

export const AuthContext = createContext({
  isAuthenticated: false,
  login: (token: string) => {},
  logout: () => {},
});

import { ReactNode } from 'react';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
