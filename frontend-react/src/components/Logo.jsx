import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ className = "", size = "160px", maxHeight = "40px", variant = "light" }) => {
  const isDark = variant === "dark";
  
  return (
    <div
      className={`logo-static-wrapper ${className}`}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center',
        justifyContent: 'center',
        height: maxHeight,
        maxHeight: maxHeight,
        width: 'auto',
        minWidth: size,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      <img 
        src="/image.png" 
        alt="Smart Hire Logo" 
        style={{ 
          height: '100%',
          width: 'auto',
          display: 'block',
          objectFit: 'contain'
        }} 
      />
    </div>
  );
};

export default Logo;
