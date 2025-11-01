import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface ThemeSwitchProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setIsAnimating: (isAnimating: boolean) => void;
  setAnimationOrigin: (origin: { x: number; y: number }) => void;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ 
  isDarkMode, 
  toggleTheme, 
  setIsAnimating,
  setAnimationOrigin
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setAnimationOrigin({ 
        x: rect.left + rect.width / 2, 
        y: rect.top + rect.height / 2 
      });
    }
    setIsAnimating(true);
    toggleTheme();
  };

  const iconVariants = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  };

  return (
    <motion.div
      className="z-50"
      initial={false}
    >
      <motion.button
        ref={buttonRef}
        onClick={handleToggle}
        className={`relative rounded-full overflow-hidden ${
          isDarkMode ? 'bg-white bg-opacity-20' : ''
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          width: '40px',
          height: '40px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: 'none',
          outline: 'none',
          transition: 'background-color 0.3s ease'
        }}
      >
        <motion.span
          key={isDarkMode ? "moon" : "sun"}
          className="text-2xl"
          variants={iconVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          {isDarkMode ? '🌙' : '☀️'}
        </motion.span>
      </motion.button>
    </motion.div>
  );
};

export default ThemeSwitch;
