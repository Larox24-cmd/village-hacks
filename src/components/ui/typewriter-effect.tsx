"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const TypewriterEffect = ({
  words,
  typingSpeed = 150,
  deletingSpeed = 50,
  pauseTime = 2000,
  className,
  cursorClassName,
}: {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  className?: string;
  cursorClassName?: string;
}) => {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = words[phraseIndex];
    
    // Function to manage the typing/deleting effect
    const handleTyping = () => {
      if (!isDeleting && text !== currentPhrase) {
        // Typing phase: Add characters
        setText(currentPhrase.slice(0, text.length + 1));
      } else if (isDeleting && text !== "") {
        // Deleting phase: Remove characters
        setText(text.slice(0, -1));
      } else if (text === currentPhrase && !isDeleting) {
        // When the phrase is fully typed, pause and start deleting
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (text === "" && isDeleting) {
        // Move to the next phrase once the current one is fully deleted
        setIsDeleting(false);
        setPhraseIndex((prevIndex) => (prevIndex + 1) % words.length); // Loop through words
      }
    };

    const timeout = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <div
      className={cn(
        "text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center",
        className
      )}
    >
      <span>{text}</span>
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-blue-500",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};

export default TypewriterEffect;
