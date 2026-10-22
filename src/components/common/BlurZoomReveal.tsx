import React, { useEffect, useRef, useState } from 'react';

export interface BlurZoomRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Milliseconds delay for staggered entrance (e.g., 0, 150, 300)
  duration?: number; // Milliseconds duration (default: 850ms)
  blur?: number; // Pixels of blur before entering view (default: 12px)
  scale?: number; // Scale before entering view (default: 0.93)
  xOffset?: number; // Horizontal offset in pixels before entering view (e.g., -70 for left, 70 for right)
  yOffset?: number; // Vertical offset in pixels before entering view (default: 20px)
  direction?: 'left' | 'right' | 'up' | 'down' | 'center' | 'none'; // Direction helper for left/center/right entry
  threshold?: number; // Viewport intersection threshold (default: 0.1)
  once?: boolean; // If true, stays revealed after first entrance. Default false for continuous scroll responsiveness
  initialOpacity?: number; // Opacity when not yet revealed (default: 0)
}

/**
 * BlurZoomReveal Component
 * Smoothly transitions elements from a blurred, scaled, or offset state (sliding in from left, center, or right)
 * into a crystal clear, full-scale sharp focus when scrolled into view, providing an ultra-high-end Apple/Stripe feel.
 */
export const BlurZoomReveal: React.FC<BlurZoomRevealProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 850,
  blur = 12,
  scale = 0.93,
  xOffset,
  yOffset = 20,
  direction = 'none',
  threshold = 0.1,
  once = false,
  initialOpacity = 0,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Compute final horizontal and vertical entrance offsets
  let computedX = isMobile ? 0 : (xOffset ?? 0);
  let computedY = isMobile ? (yOffset === 20 ? 15 : yOffset) : yOffset;

  if (!isMobile) {
    if (direction === 'left') {
      computedX = xOffset ?? -70;
      computedY = yOffset === 20 ? 0 : yOffset;
    } else if (direction === 'right') {
      computedX = xOffset ?? 70;
      computedY = yOffset === 20 ? 0 : yOffset;
    } else if (direction === 'up' || direction === 'center') {
      computedX = xOffset ?? 0;
      computedY = yOffset === 20 ? 35 : yOffset;
    } else if (direction === 'down') {
      computedX = xOffset ?? 0;
      computedY = yOffset === 20 ? -35 : yOffset;
    }
  } else {
    // Mobile: gentle directional slide and rise
    if (direction === 'left') {
      computedX = xOffset ? Math.max(xOffset, -30) : -25;
      computedY = yOffset === 20 ? 12 : yOffset;
    } else if (direction === 'right') {
      computedX = xOffset ? Math.min(xOffset, 30) : 25;
      computedY = yOffset === 20 ? 12 : yOffset;
    } else if (direction === 'up' || direction === 'center' || yOffset !== 0) {
      computedX = 0;
      computedY = 20;
    } else if (direction === 'down') {
      computedX = 0;
      computedY = -20;
    }
  }

  const effectiveBlur = isMobile ? Math.min(blur, 4) : blur;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            if (once) {
              observer.unobserve(el);
            }
          } else if (!once) {
            // Re-apply subtle blur and slide-out when scrolling away
            setIsRevealed(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        opacity: isRevealed ? 1 : initialOpacity,
        filter: isRevealed ? 'blur(0px)' : `blur(${effectiveBlur}px)`,
        transform: isRevealed
          ? 'scale(1) translate3d(0, 0, 0)'
          : `scale(${scale}) translate3d(${computedX}px, ${computedY}px, 0)`,
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: 'opacity, filter, transform',
      }}
    >
      {children}
    </div>
  );
};
