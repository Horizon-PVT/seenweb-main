import React, { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  content: string;
  speed?: number;
  className?: string;
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ 
  content, 
  speed = 10, 
  className = "" 
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!content) {
      setDisplayedContent('');
      return;
    }

    setDisplayedContent('');
    setIsTyping(true);
    
    const chars = Array.from(content);
    let i = 0;
    
    const timer = setInterval(() => {
      if (i < chars.length) {
        setDisplayedContent(prev => prev + chars[i]);
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [content, speed]);

  return (
    <div className={className}>
      {displayedContent}
      {isTyping && (
        <span className="inline-block w-1.5 bg-emerald-500 animate-pulse ml-1" style={{ height: '1.1em', verticalAlign: 'middle', opacity: 0.8 }}></span>
      )}
    </div>
  );
};
