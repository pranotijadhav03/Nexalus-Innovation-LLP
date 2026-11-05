import React, { useEffect, useState, useRef } from 'react';

interface TypewriterHeadingProps {
  text: string;
  className?: string;
  cursorColor?: string;
  cursorClassName?: string;
}

/**
 * TypewriterHeading — High-performance, isolated animated text component.
 *
 * Types quickly (2-3 chars per frame) so it completes in ~200ms without lag.
 * Maintains its own local state so it NEVER causes parent page re-renders.
 */
export const TypewriterHeading: React.FC<TypewriterHeadingProps> = ({
  text,
  className = '',
  cursorColor = 'bg-cyan-400',
  cursorClassName = ''
}) => {
  const [displayText, setDisplayText] = useState(() => text);
  const [isTyping, setIsTyping] = useState(false);
  const prevTextRef = useRef(text);

  useEffect(() => {
    // If text hasn't changed, keep current
    if (prevTextRef.current === text) {
      setDisplayText(text);
      return;
    }

    prevTextRef.current = text;
    if (!text) {
      setDisplayText('');
      return;
    }

    // Start typing rapidly (chunking 2-3 characters every 12ms for high-FPS, fast reveal)
    setIsTyping(true);
    let index = Math.min(6, text.length); // Show first few chars immediately so no jarring blank
    setDisplayText(text.slice(0, index));

    const interval = setInterval(() => {
      index += 3;
      if (index >= text.length) {
        setDisplayText(text);
        setIsTyping(false);
        clearInterval(interval);
      } else {
        setDisplayText(text.slice(0, index));
      }
    }, 12);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className={className}>
      <span>{displayText || '\u00A0'}</span>
      <span
        className={`inline-block w-2 sm:w-2.5 h-6 sm:h-9 ${cursorColor} rounded-xs ml-1.5 align-middle transition-opacity duration-200 ${
          isTyping ? 'opacity-100 animate-pulse' : 'opacity-0'
        } ${cursorClassName}`}
        aria-hidden="true"
      />
    </span>
  );
};
