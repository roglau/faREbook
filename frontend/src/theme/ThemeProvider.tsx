import { useState, useEffect } from 'react';

export const changeTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') == 'true' ? true : false);

  useEffect(() => {
    // console.log(isDarkMode, localStorage.getItem('darkMode'))
    document.documentElement.classList.toggle('dark-theme', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevIsDarkMode => !prevIsDarkMode);
  };

  return { isDarkMode, toggleTheme };
};
