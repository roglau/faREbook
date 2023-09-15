import React, { useState, useEffect } from 'react';
import './ThemeChanger.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import '../theme/theme.css';
import { changeTheme } from '../theme/ThemeProvider';

const Theme = () => {

  const { isDarkMode, toggleTheme } = changeTheme();

  return (
    <div>
        <input type="checkbox" className="checkbox" id="checkbox"  onChange={toggleTheme}/>
        <label htmlFor="checkbox" className="checkbox-label">
            <FontAwesomeIcon icon={faMoon} className={'fa-moon'} />
            <FontAwesomeIcon icon={faSun} className={'fa-sun'} />
            <span className="ball"></span>
        </label>
    </div>
  );
};

export default Theme;
