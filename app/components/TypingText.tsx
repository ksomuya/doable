import React, { useState, useEffect } from 'react';
import { Text, TextStyle } from 'react-native';

interface TypingTextProps {
  text: string;
  style?: TextStyle;
  typingSpeed?: number;
  onTypingComplete?: () => void;
  className?: string;
}

const TypingText: React.FC<TypingTextProps> = ({
  text,
  style,
  typingSpeed = 50,
  onTypingComplete,
  className
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed);
      
      return () => clearTimeout(timeout);
    } else if (onTypingComplete && currentIndex === text.length) {
      onTypingComplete();
    }
  }, [currentIndex, text, typingSpeed, onTypingComplete]);

  return (
    <Text style={style} className={className}>
      {displayedText}
      <Text style={{ opacity: currentIndex === text.length ? 0 : 1 }}>|</Text>
    </Text>
  );
};

export default TypingText; 