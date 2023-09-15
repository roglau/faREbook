import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import '../index.css';
import { AiFillCloseCircle } from 'react-icons/ai';

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCancelSearch: () => void;
  placeholder: string;
  onEnterPress : any;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onCancelSearch,
  placeholder,
  onEnterPress
}) => {

  const handleClearSearch = () => {
    onCancelSearch();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onEnterPress(event)
    }
  };

  return (
    <div className="search-bar">
      <div className="search-icon">
        <FiSearch />
      </div>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown} // Attach the event handler for Enter key press
      />
      {value && (
        <AiFillCloseCircle className="clear-button" onClick={handleClearSearch}/>
      )}
    </div>
  );
};

export default SearchBar;
