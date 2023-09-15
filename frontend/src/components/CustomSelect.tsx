import React, { useState, useRef } from 'react';
import './CustomSelect.css'

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  selectedOptions: any;
  onChange: any;
  placeholder: any;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, selectedOptions, onChange, placeholder }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const selectRef = useRef<HTMLInputElement | null>(null);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setSearchQuery('');
  };

  const handleSelectOption = (option: Option) => {
    if (selectedOptions.some((item : any) => item.value === option.value)) {
        onChange(selectedOptions.filter((item : any) => item.value !== option.value));
      } else {
        onChange([...selectedOptions, option]);
      }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredOptions = options?.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="custom-select">
      {selectedOptions.length > 0 && (<div className="selected-values">
        {selectedOptions.map((option : any) => (
          <span key={option.value}>{option.label}</span>
        ))}
      </div>)}
      <div className="select-input" onClick={handleToggleDropdown}>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleToggleDropdown}
          ref={selectRef}
        />
      </div>
      {isDropdownOpen && (
        <ul className="options-list">
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelectOption(option)}
              className={selectedOptions.some((item : any) => item.value === option.value) ? 'selected' : ''}              
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
