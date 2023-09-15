import React from 'react';
import './LoadingIndicator.css'

interface LoadingIndicatorProps {
  loading: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ loading }) => {
  return loading ? (
    <div className="loading-indicator-overlay">
      <div className="loading-indicator-content">
        <div className="loading-spinner"></div>
      </div>
    </div>
  ) : null;
};

export default LoadingIndicator;
