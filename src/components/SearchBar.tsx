
import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'minimal';
}

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search by specialty or doctor name...", 
  className,
  variant = 'default'
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "relative w-full transition-all duration-300 ease-in-out",
        variant === 'default' ? "max-w-2xl" : "",
        isFocused ? "scale-[1.01]" : "scale-100",
        className
      )}
    >
      <div className={cn(
        "flex items-center w-full overflow-hidden transition-all duration-300",
        variant === 'default' ? "bg-white border border-gray-200 shadow-subtle rounded-xl px-4 py-3" : "bg-gray-100 rounded-lg px-3 py-2",
        isFocused && variant === 'default' ? "shadow-elevated" : ""
      )}>
        <Search 
          size={variant === 'default' ? 20 : 16} 
          className={cn(
            "flex-shrink-0 transition-colors duration-200", 
            isFocused ? "text-health-600" : "text-gray-400"
          )} 
        />
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "flex-grow focus:outline-none bg-transparent ml-3",
            variant === 'default' ? "text-base" : "text-sm"
          )}
        />
      </div>
      <button type="submit" hidden>Search</button>
    </form>
  );
};

export default SearchBar;
