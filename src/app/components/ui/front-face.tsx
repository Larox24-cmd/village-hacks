// src/app/components/ui/front-face.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const FrontFace = () => {
    const images = [
        '/Bitmoji Animation/1.png',
        '/Bitmoji Animation/2.png',
        '/Bitmoji Animation/3.png',
        '/Bitmoji Animation/4.png',
        '/Bitmoji Animation/5.png',
        '/Bitmoji Animation/6.png',
        '/Bitmoji Animation/7.png',
        // Add the paths to your images
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 1000); // Change every 1 second

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className="w-full h-full relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                >
                    <Image
                        src={images[currentIndex]}
                        alt="Slideshow"
                        layout="fill"
                        objectFit="contain"
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default FrontFace;
