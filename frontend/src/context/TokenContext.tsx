import React, { createContext, useContext, useState } from 'react';

interface TokenContextType {
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const useTokenContext = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useTokenContext must be used within a TokenProvider');
  }
  return context;
};

interface TokenProviderProps {
  children: React.ReactNode;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string>(''); // Initialize with your initial token value

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
};
