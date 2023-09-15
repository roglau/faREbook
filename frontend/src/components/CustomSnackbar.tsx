import React from 'react';

interface CustomSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({ open, message, onClose }) => {
  return (
    <div className={`snackbar ${open ? 'show' : ''}`}>
      <div className="snackbar-content">
        <p>{message}</p>
      </div>
      <button className="snackbar-close" onClick={onClose}>
        X
      </button>
    </div>
  );
};

export default CustomSnackbar;
