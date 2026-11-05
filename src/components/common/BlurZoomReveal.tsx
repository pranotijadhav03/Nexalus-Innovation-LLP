import React, { useEffect, useRef, useState } from 'react';

export interface BlurZoomRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;        // Milliseconds delay for staggered entrance (e.g. 0, 40, 80)
  duration?: number;     // Animation duration in ms (default: 260 for instant snappy feel)
  blur?: number;         // Blur px before enter (default: 2)
  scale?: number;        // Scale before reveal (default: 0.99)
  xOffset?: number;      // Horizontal slide px before reveal
  yOffset?: number;      // Vertical slide px before reveal (default: 12)
  direction?: 'left' | 'right' | 'up' | 'down' | 'center' | 'none';
  threshold?: number;    // Viewport intersection threshold (default: 0.01)
  once?: boolean;        // Stay revealed after first entrance (default: true)
  initialOpacity?: number;
}

/**
 * BlurZoomReveal — Professional, ultra-fast scroll-triggered entrance animation.
 *
 * Silky smooth and near-instant: reveals contents promptly as soon as they scroll
 * into view with zero perceptible lag.
 */
export const BlurZoomReveal: React.FC<BlurZoomRevealProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 260,
  blur = 2,
  scale = 0.99,
  xOffset,
  yOffset = 12,
  direction = 'up',
  threshold = 0.01,
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
        // Trigger reveal slightly before reaching viewport so content is instantly visible on entry
        rootMargin: '100px 0px 0px 0px',
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
