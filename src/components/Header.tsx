
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  // Handle scroll effect for glass morphism header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ease-in-out",
        scrolled ? "glass shadow-subtle" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-health-800 font-semibold text-xl tracking-tight transition-opacity hover:opacity-80"
        >
          Health<span className="text-health-600">Care</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/" label="Home" isActive={location.pathname === '/'} />
          <NavLink to="/doctors" label="Doctors" isActive={location.pathname.startsWith('/doctors')} />
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link to="/doctors" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 shadow-subtle hover:bg-white transition-colors duration-200">
            <Search size={18} className="text-health-700" />
          </Link>
          <Link 
            to={user ? "/profile" : "/auth"} 
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 shadow-subtle hover:bg-white transition-colors duration-200"
          >
            <User size={18} className="text-health-700" />
          </Link>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  label: string;
  isActive: boolean;
}

const NavLink = ({ to, label, isActive }: NavLinkProps) => (
  <Link
    to={to}
    className={cn(
      "relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
      isActive ? "text-health-700" : "text-gray-600 hover:text-health-600"
    )}
  >
    {label}
    {isActive && (
      <span className="absolute bottom-0 left-1/2 w-1/2 h-0.5 bg-health-500 transform -translate-x-1/2 rounded-full" />
    )}
  </Link>
);

export default Header;
