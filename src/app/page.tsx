'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import 

// const AnimatedThemeSwitch = motion(ThemeSwitch);

const switchVariants = {
  light: { x: 0 },
  dark: { x: 28 },
};

const phrases = [
  { text: "WEBSITE DEVELOPER" },
  { text: "AUTOMATION ENGINEER" },
  { text: "ASU SOPHOMORE" },
  { text: "ROBOTICS ENTHUSIAST" },
];

const sections = [
  { id: 'home', title: 'Home' },
  { id: 'aboutme', title: 'About' },
  { id: 'projects', title: 'Projects' },
  { id: 'skills', title: 'Skills' },
  { id: 'resume', title: 'Resume' },
  { id: 'experience', title: 'Experience' },
];

export default function Home() {
  const [activeSection, setActiveSection] = useState('');
  const { isDarkMode, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationOrigin, setAnimationOrigin] = useState({ x: 0, y: 0 });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveSection(entry.target.id);
      }
    });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    observerRef.current = new IntersectionObserver(handleIntersection, { threshold: 0.5 });

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observerRef.current?.observe(element);
    });

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const getAnimationRadius = () => {
    const maxDimension = Math.max(window.innerWidth, window.innerHeight);
    return Math.sqrt(2) * maxDimension; // Diagonal of the screen
  };

  const getGradientStyle = (progress: number) => {
    const darkColor = 'rgba(24, 24, 27, 1)'; // Dark theme color
    const lightColor = 'rgba(255, 255, 255, 1)'; // Light theme color
    const transparentColor = 'rgba(0, 0, 0, 0)';
    
    const fromColor = isDarkMode ? lightColor : darkColor;
    const toColor = isDarkMode ? darkColor : lightColor;

    return `radial-gradient(circle at ${animationOrigin.x}px ${animationOrigin.y}px, 
      ${fromColor} 0%, 
      ${fromColor} ${progress * 100}%, 
      ${transparentColor} ${progress * 100}%, 
      ${transparentColor} 100%)`;
  };

  return (
    <>
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            key="theme-overlay"
            initial={{ background: getGradientStyle(0) }}
            animate={{ background: getGradientStyle(1) }}
            exit={{ background: getGradientStyle(0) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onAnimationComplete={() => setIsAnimating(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
            }}
          />
        )}
      </AnimatePresence>
      <WelcomePage />
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'}`}>
        {/* Theme Switch at the top */}
        <div className="fixed top-4 left-4 z-30">
          <ThemeSwitch 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme} 
            setIsAnimating={setIsAnimating}
            setAnimationOrigin={setAnimationOrigin}
          />
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10">
          {/* Home Section */}
          <section id="home" className="min-h-screen flex flex-col items-center justify-center p-24">
            <div className="flex flex-col justify-center items-center mb-10 md:flex-row">
              <div className="mb-4 md:mb-0 md:mr-4 home-left flex flex-col justify-center space-y-5 in-view">
                <div className='text-8xl md:text-8xl lg:text-8xl font-bold font-mono text-translucent'>
                  <span className="animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent animate-gradient-x">
                    LAKSHANAND SUGUMAR
                  </span>
                </div>
                <div className='font-mono text-5xl md:text-6xl lg:text-7xl'>
                  <TypewriterEffect  
                    words={phrases.map(phrase => phrase.text)} 
                    className="text-4xl font-bold"
                    cursorClassName="bg-red-500"
                  />
                </div>
              </div>  
          
            </div>
          </section>

          <section id="aboutme" className="min-h-screen flex items-center justify-center">
            <AboutMe />
          </section>
          <section id="projects" className="min-h-screen flex items-center justify-center">
            <Project />
          </section>
          <section id="skills" className="min-h-screen flex items-center justify-center">
            <Skills />
          </section>
          <section id="resume" className="min-h-screen flex items-center justify-center">
            <Resume />
          </section>
          <section id="experience" className="min-h-screen flex items-center justify-center">
            <Experience />
          </section>
        </div>

        {/* Navigation Bar at the bottom */}
        <div className={`fixed bottom-0 left-0 right-0 mb-4 font-mono text-xl z-20 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className='flex justify-center items-center'>
            <Bar />   
          </div>
        </div>

        {/* Coms component at the bottom-right */}
        <div className='fixed right-0 bottom-0 flex flex-col items-center mr-4 mb-4 space-y-4 z-20'>
          <Coms />
        </div>
        
      </div>
    </>
    
  );
}
