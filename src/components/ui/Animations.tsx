import React, { useEffect, useState, useRef } from 'react';
import '../styles/responsive.css';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  trigger?: boolean;
  className?: string;
}

/**
 * Fade in animation component with configurable direction and timing
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  duration = 300,
  delay = 0,
  direction = 'up',
  distance = 20,
  trigger = true,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [trigger, delay]);

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return `translateY(${distance}px)`;
        case 'down':
          return `translateY(-${distance}px)`;
        case 'left':
          return `translateX(${distance}px)`;
        case 'right':
          return `translateX(-${distance}px)`;
        default:
          return 'none';
      }
    }
    return 'none';
  };

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: getTransform(),
    transition: `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`,
    transitionDelay: `${delay}ms`,
  };

  return (
    <div
      ref={elementRef}
      className={`fade-in ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  direction: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  distance?: number;
  trigger?: boolean;
  className?: string;
}

/**
 * Slide in animation component
 */
export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction,
  duration = 300,
  delay = 0,
  distance = 100,
  trigger = true,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [trigger, delay]);

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return `translateY(${distance}px)`;
        case 'down':
          return `translateY(-${distance}px)`;
        case 'left':
          return `translateX(${distance}px)`;
        case 'right':
          return `translateX(-${distance}px)`;
        default:
          return 'none';
      }
    }
    return 'none';
  };

  const style = {
    transform: getTransform(),
    transition: `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    transitionDelay: `${delay}ms`,
  };

  return (
    <div
      ref={elementRef}
      className={`slide-in ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

interface ScaleInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  initialScale?: number;
  trigger?: boolean;
  className?: string;
}

/**
 * Scale in animation component
 */
export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  duration = 300,
  delay = 0,
  initialScale = 0.9,
  trigger = true,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [trigger, delay]);

  const style = {
    transform: isVisible ? 'scale(1)' : `scale(${initialScale})`,
    opacity: isVisible ? 1 : 0,
    transition: `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${duration}ms ease-in-out`,
    transitionDelay: `${delay}ms`,
  };

  return (
    <div
      ref={elementRef}
      className={`scale-in ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

interface RotateProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  degrees?: number;
  trigger?: boolean;
  infinite?: boolean;
  className?: string;
}

/**
 * Rotation animation component
 */
export const Rotate: React.FC<RotateProps> = ({
  children,
  duration = 1000,
  delay = 0,
  degrees = 360,
  trigger = true,
  infinite = false,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger) return;

    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [trigger, delay]);

  const style = {
    transform: isAnimating ? `rotate(${degrees}deg)` : 'rotate(0deg)',
    transition: `transform ${duration}ms ease-in-out`,
    transitionDelay: `${delay}ms`,
    animation: infinite && isAnimating ? `rotate ${duration}ms linear infinite` : 'none',
  };

  return (
    <div
      ref={elementRef}
      className={`rotate ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

interface PulseProps {
  children: React.ReactNode;
  duration?: number;
  scale?: number;
  trigger?: boolean;
  infinite?: boolean;
  className?: string;
}

/**
 * Pulse animation component
 */
export const Pulse: React.FC<PulseProps> = ({
  children,
  duration = 1000,
  scale = 1.05,
  trigger = true,
  infinite = true,
  className = '',
}) => {
  const [isPulsing, setIsPulsing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger) return;

    const timer = setTimeout(() => {
      setIsPulsing(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [trigger]);

  const style = {
    animation: isPulsing && infinite
      ? `pulse ${duration}ms ease-in-out infinite`
      : isPulsing
        ? `pulse-once ${duration}ms ease-in-out`
        : 'none',
  };

  return (
    <div
      ref={elementRef}
      className={`pulse ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

interface BounceProps {
  children: React.ReactNode;
  duration?: number;
  height?: number;
  trigger?: boolean;
  className?: string;
}

/**
 * Bounce animation component
 */
export const Bounce: React.FC<BounceProps> = ({
  children,
  duration = 600,
  height = 20,
  trigger = true,
  className = '',
}) => {
  const [isBouncing, setIsBouncing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger) return;

    const timer = setTimeout(() => {
      setIsBouncing(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [trigger]);

  const style = {
    animation: isBouncing ? `bounce ${duration}ms ease-in-out` : 'none',
  };

  return (
    <div
      ref={elementRef}
      className={`bounce ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

interface StaggerProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  duration?: number;
  animation?: 'fade-in' | 'slide-in' | 'scale-in';
  direction?: 'up' | 'down' | 'left' | 'right';
  trigger?: boolean;
  className?: string;
}

/**
 * Stagger animation component for animating multiple children with delays
 */
export const Stagger: React.FC<StaggerProps> = ({
  children,
  staggerDelay = 100,
  duration = 300,
  animation = 'fade-in',
  direction = 'up',
  trigger = true,
  className = '',
}) => {
  return (
    <div className={`stagger ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const delay = index * staggerDelay;

        switch (animation) {
          case 'slide-in':
            return (
              <SlideIn
                key={index}
                direction={direction || 'up'}
                duration={duration}
                delay={delay}
                trigger={trigger}
              >
                {child}
              </SlideIn>
            );
          case 'scale-in':
            return (
              <ScaleIn
                key={index}
                duration={duration}
                delay={delay}
                trigger={trigger}
              >
                {child}
              </ScaleIn>
            );
          case 'fade-in':
          default:
            return (
              <FadeIn
                key={index}
                direction={direction || 'up'}
                duration={duration}
                delay={delay}
                trigger={trigger}
              >
                {child}
              </FadeIn>
            );
        }
      })}
    </div>
  );
};

/**
 * Intersection Observer hook for triggering animations on scroll
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  return { isVisible, elementRef };
};

/**
 * Scroll-triggered animation component
 */
interface ScrollTriggerProps {
  children: React.ReactNode;
  animation?: 'fade-in' | 'slide-in' | 'scale-in';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  threshold?: number;
  className?: string;
}

export const ScrollTrigger: React.FC<ScrollTriggerProps> = ({
  children,
  animation = 'fade-in',
  direction = 'up',
  duration = 600,
  delay = 0,
  threshold = 0.1,
  className = '',
}) => {
  const { isVisible, elementRef } = useIntersectionObserver({
    threshold,
  });

  const commonProps = {
    trigger: isVisible,
    duration,
    delay,
    className,
  };

  switch (animation) {
    case 'slide-in':
      return (
        <div ref={elementRef}>
          <SlideIn direction={direction || 'up'} {...commonProps}>
            {children}
          </SlideIn>
        </div>
      );
    case 'scale-in':
      return (
        <div ref={elementRef}>
          <ScaleIn {...commonProps}>
            {children}
          </ScaleIn>
        </div>
      );
    case 'fade-in':
    default:
      return (
        <div ref={elementRef}>
          <FadeIn direction={direction || 'up'} {...commonProps}>
            {children}
          </FadeIn>
        </div>
      );
  }
};

export default {
  FadeIn,
  SlideIn,
  ScaleIn,
  Rotate,
  Pulse,
  Bounce,
  Stagger,
  ScrollTrigger,
  useIntersectionObserver,
};