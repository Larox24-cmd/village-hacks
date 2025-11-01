import React from 'react';
import { motion } from 'framer-motion';

const sections = [
  { id: 'home', title: 'Home' },
  { id: 'aboutme', title: 'About' },
  { id: 'projects', title: 'Projects' },
  { id: 'skills', title: 'Skills' },
  { id: 'resume', title: 'Resume' },
  { id: 'experience', title: 'Experience' },
];

const Bar: React.FC = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 rounded-full shadow-lg">
      <ul className="flex space-x-6">
        {sections.filter(section => section.id !== 'home').map((section) => (
          <li key={section.id}>
            <motion.a
              href={`#${section.id}`}
              className="hover:text-gray-300 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {section.title}
            </motion.a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Bar;
