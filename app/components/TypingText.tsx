import React, { useState, useEffect } from 'react';
import { Text, TextStyle } from 'react-native';

interface TypingTextProps {
  text: string;
  style?: TextStyle;
  typingSpeed?: number;
  onTypingComplete?: () => void;
  className?: string;
  showCursor?: boolean;
  addPeriod?: boolean;
}

const TypingText: React.FC<TypingTextProps> = ({
  text,
  style,
  typingSpeed = 20,
  onTypingComplete,
  className,
  showCursor = true,
  addPeriod = true
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed);
      
      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      
      // Add a period at the end if requested and the text doesn't already end with punctuation
      if (addPeriod && text.length > 0) {
        const lastChar = text[text.length - 1];
        if (!['.', '!', '?', ',', ';', ':'].includes(lastChar)) {
          setDisplayedText(prev => prev + '.');
        }
      }
      
      // Call completion callback
      if (onTypingComplete) {
        onTypingComplete();
      }
    }
  }, [currentIndex, text, typingSpeed, onTypingComplete, addPeriod, isComplete]);

  return (
    <Text style={style} className={className}>
      {displayedText}
      {showCursor && !isComplete && (
        <Text style={{ opacity: currentIndex === text.length ? 0 : 1 }}>|</Text>
      )}
    </Text>
  );
};

export default TypingText; 