import React, { useEffect, useRef, useState } from 'react';

export interface BlurZoomRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Milliseconds delay for staggered entrance (e.g., 0, 150, 300)
  duration?: number; // Milliseconds duration (default: 800ms)
  blur?: number; // Pixels of blur before entering view (default: 12px)
  scale?: number; // Scale before entering view (default: 0.92)
  xOffset?: number; // Horizontal offset in pixels before entering view (e.g., -60 for left, 60 for right)
  yOffset?: number; // Vertical offset in pixels before entering view (default: 20px)
  direction?: 'left' | 'right' | 'up' | 'down' | 'none'; // Direction helper for left/right entry
  threshold?: number; // Viewport intersection threshold (default: 0.12)
  once?: boolean; // If true, stays revealed after first entrance. Default false for continuous scroll responsiveness
}

/**
 * BlurZoomReveal Component
 * Smoothly transitions elements from a blurred, scaled, or offset state (sliding in from left, right, or bottom)
 * into a crystal clear, full-scale sharp focus when scrolled into view, providing an ultra-high-end Apple/Stripe feel.
 */
export const BlurZoomReveal: React.FC<BlurZoomRevealProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 850,
  blur = 12,
  scale = 0.94,
  xOffset,
  yOffset = 20,
  direction = 'none',
  threshold = 0.1,
  once = false,
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

  // Compute final horizontal and vertical entrance offsets (disable horizontal offsets on mobile to prevent side-scroll shaking)
  let computedX = isMobile ? 0 : (xOffset ?? 0);
  let computedY = isMobile ? (yOffset === 20 ? 15 : yOffset) : yOffset;

  if (!isMobile) {
    if (direction === 'left') {
      computedX = xOffset ?? -60;
      computedY = yOffset === 20 ? 0 : yOffset;
    } else if (direction === 'right') {
      computedX = xOffset ?? 60;
      computedY = yOffset === 20 ? 0 : yOffset;
    } else if (direction === 'up') {
      computedX = xOffset ?? 0;
      computedY = yOffset === 20 ? 30 : yOffset;
    } else if (direction === 'down') {
      computedX = xOffset ?? 0;
      computedY = yOffset === 20 ? -30 : yOffset;
    }
  } else {
    // Mobile: gentle vertical slide only
    if (direction === 'up' || yOffset !== 0) {
      computedY = 15;
    } else if (direction === 'down') {
      computedY = -15;
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
        opacity: isRevealed ? 1 : 0.15,
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
