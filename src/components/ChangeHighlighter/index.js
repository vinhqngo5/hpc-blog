import React from 'react';
import './highlight.css'; // Import your CSS file for styling

const Old = ({ children }) => {
  return (
    <span className="old-highlight">{children}</span>
  );
};

const New = ({ children }) => {
  return (
    <span className="new-highlight">{children}</span>
  );
};

export { Old, New }; // Export both components
