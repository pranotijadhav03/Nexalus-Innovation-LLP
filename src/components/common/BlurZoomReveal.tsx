import React, { useEffect, useRef, useState } from 'react';

export interface BlurZoomRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;        // Milliseconds delay for staggered entrance (e.g. 0, 60, 120)
  duration?: number;     // Animation duration in ms (default: 600)
  blur?: number;         // Blur px before enter (default: 4)
  scale?: number;        // Scale before reveal (default: 0.97)
  xOffset?: number;      // Horizontal slide px before reveal
  yOffset?: number;      // Vertical slide px before reveal (default: 28)
  direction?: 'left' | 'right' | 'up' | 'down' | 'center' | 'none';
  threshold?: number;    // Viewport intersection threshold (default: 0.05)
  once?: boolean;        // Stay revealed after first entrance (default: true)
  initialOpacity?: number;
}

/**
 * BlurZoomReveal — Professional scroll-triggered fade-up entrance animation.
 *
 * Each element smoothly glides up and fades in as the user scrolls it into view.
 * Uses IntersectionObserver for real scroll events.
 * Transition is always defined so every entrance is silky smooth.
 */
export const BlurZoomReveal: React.FC<BlurZoomRevealProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 600,
  blur = 4,
  scale = 0.97,
  xOffset,
  yOffset = 28,
  direction = 'up',
  threshold = 0.05,
  once = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setReveal] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setReveal(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setReveal(true);
            if (once) {
              observer.unobserve(el);
            }
          }
        });
      },
      {
        threshold,
        // Start animation when element is within 40px of entering viewport
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [once, threshold]);

  // Compute subtle directional offsets
  let tx = 0, ty = 0;
  if (!revealed) {
    switch (direction) {
      case 'left':   tx = xOffset ?? -35; ty = 0; break;
      case 'right':  tx = xOffset ?? 35;  ty = 0; break;
      case 'up':
      case 'center': tx = 0; ty = yOffset ?? 28; break;
      case 'down':   tx = 0; ty = -(yOffset ?? 28); break;
      case 'none':   tx = 0; ty = 0; break;
      default:       tx = 0; ty = yOffset ?? 28; break;
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: revealed ? 1 : 0,
        filter: revealed ? 'blur(0px)' : (blur > 0 ? `blur(${blur}px)` : 'none'),
        transform: revealed
          ? 'scale(1) translate3d(0, 0, 0)'
          : `scale(${scale}) translate3d(${tx}px, ${ty}px, 0)`,
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: 'opacity, filter, transform',
      }}
    >
      {children}
    </div>
  );
};
