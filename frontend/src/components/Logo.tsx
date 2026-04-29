import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Premium Theme-Aware Logo for StockUp.
 * Adapts to Day/Night cycles via CSS variables.
 */
const Logo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-300 hover:scale-110 group ${className}`} 
      style={{ width: size, height: size }}
    >
      {/* Dynamic Glow Layer */}
      <div 
        className="absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-40 dark:group-hover:opacity-60 transition-all duration-500"
        style={{ 
          background: 'var(--button)',
          transform: 'scale(1.2)' 
        }}
      />
      
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full transition-transform duration-500 group-hover:rotate-[5deg]"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          
          <linearGradient id="cartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--text)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--text)" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Shopping Cart Body (Premium Basket Shape) */}
        <path 
          d="M15 52 C15 48 85 48 85 52 C85 55 80 75 75 80 C70 85 30 85 25 80 C20 75 15 55 15 52Z" 
          className="fill-secondary-800 dark:fill-primary-500/20 stroke-secondary-900 dark:stroke-primary-400"
          strokeWidth="1.5"
        />
        
        {/* Cart Inner Lines */}
        <path 
          d="M32 52 L35 81 M50 52 L50 84 M68 52 L65 81 M25 65 H75" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          className="text-white/10 dark:text-primary-300/30"
        />

        {/* Wheels with depth */}
        <g className="fill-secondary-900 dark:fill-primary-400">
          <circle cx="32" cy="90" r="7" />
          <circle cx="68" cy="90" r="7" />
          <circle cx="32" cy="90" r="3" fill="white" fillOpacity="0.2" />
          <circle cx="68" cy="90" r="3" fill="white" fillOpacity="0.2" />
        </g>
        
        {/* Wheel Chassis */}
        <path 
          d="M25 80 Q25 90 32 90 H68 Q75 90 75 80" 
          fill="none" 
          className="stroke-secondary-900 dark:stroke-primary-400" 
          strokeWidth="4" 
          strokeLinecap="round" 
        />

        {/* The 'S' (Hook/Ribbon Shape) */}
        <path 
          d="M65 52 C65 25 20 28 20 18 C20 8 80 8 80 18 C80 28 35 30 35 40 C35 50 65 50 65 52" 
          fill="none" 
          stroke="url(#logoGradient)" 
          strokeWidth="14" 
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
        />
        
        {/* Shine on 'S' */}
        <path 
          d="M65 52 C65 25 20 28 20 18" 
          fill="none" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round"
          strokeOpacity="0.2"
          className="transition-opacity duration-700"
        />
      </svg>
    </div>
  );
};

export default Logo;
