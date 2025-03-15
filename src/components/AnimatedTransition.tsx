
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'scale';
  duration?: 'fast' | 'normal' | 'slow';
  delay?: number;
}

const AnimatedTransition = ({
  children,
  className,
  animation = 'fade',
  duration = 'normal',
  delay = 0,
}: AnimatedTransitionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  const getAnimationClass = () => {
    switch (animation) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide-up':
        return 'animate-slide-up';
      case 'slide-down':
        return 'animate-slide-down';
      case 'scale':
        return 'animate-scale-in';
      default:
        return 'animate-fade-in';
    }
  };
  
  const getDurationClass = () => {
    switch (duration) {
      case 'fast':
        return 'duration-200';
      case 'normal':
        return 'duration-300';
      case 'slow':
        return 'duration-500';
      default:
        return 'duration-300';
    }
  };
  
  return (
    <div
      className={cn(
        "transition-opacity",
        isVisible ? 'opacity-100' : 'opacity-0',
        isVisible && getAnimationClass(),
        getDurationClass(),
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedTransition;
