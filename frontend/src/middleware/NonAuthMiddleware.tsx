import React, { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { encryptStorage } from '../pages/auth/login';

interface AuthMiddlewareProps {
  children: ReactNode;
}

const NonAuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const navigate = useNavigate();

  const token = encryptStorage.getItem("jwtToken")
  
  useEffect(() => {    
    if(token)
     navigate('/'); 
  }, [token])
  

  return <>{children}</>;
};

export default NonAuthMiddleware
