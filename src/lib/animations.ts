
import { useEffect, useState } from 'react';

export function usePageTransition() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);
  
  return isVisible;
}

export function useDelayedRender(delay: number = 100): boolean {
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return shouldRender;
}

export function useStaggeredChildren(totalChildren: number, baseDelay: number = 50) {
  return Array.from({ length: totalChildren }).map((_, i) => i * baseDelay);
}
