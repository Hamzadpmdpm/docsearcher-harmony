
import { useState } from 'react';
import { Search, Sliders, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import SpecialtyFilter from './SpecialtyFilter';
import WilayaFilter from './WilayaFilter';
import { Badge } from '@/components/ui/badge';

interface SearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'minimal';
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  specialty?: string | null;
  wilaya?: string | null;
}

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search by specialty or doctor name...", 
  className,
  variant = 'default',
  initialFilters
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {
    specialty: null,
    wilaya: null
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
  };

  const updateFilters = (key: keyof SearchFilters, value: string | null) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilter = (key: keyof SearchFilters) => {
    updateFilters(key, null);
    onSearch(query, {
      ...filters,
      [key]: null
    });
  };

  const hasActiveFilters = filters.specialty || filters.wilaya;

  return (
    <div className={cn(
      "w-full transition-all duration-300 ease-in-out",
      variant === 'default' ? "max-w-2xl" : "",
      className
    )}>
      <form 
        onSubmit={handleSubmit} 
        className={cn(
          "relative w-full transition-all duration-300 ease-in-out",
          isFocused ? "scale-[1.01]" : "scale-100",
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
          <button 
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "ml-2 p-1 rounded-md transition-colors duration-200",
              showFilters ? "bg-health-100 text-health-600" : "text-gray-400 hover:text-gray-600",
            )}
          >
            <Sliders size={variant === 'default' ? 20 : 16} />
          </button>
        </div>
        <button type="submit" hidden>Search</button>
      </form>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="mt-2 flex flex-wrap gap-2">
          {filters.specialty && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-health-50 text-health-700 border-health-200">
              Specialty: {filters.specialty}
              <button
                onClick={() => clearFilter('specialty')}
                className="ml-1 text-health-700 hover:text-health-900"
              >
                <X size={14} />
              </button>
            </Badge>
          )}
          {filters.wilaya && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-health-50 text-health-700 border-health-200">
              Wilaya: {filters.wilaya}
              <button
                onClick={() => clearFilter('wilaya')}
                className="ml-1 text-health-700 hover:text-health-900"
              >
                <X size={14} />
              </button>
            </Badge>
          )}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setFilters({ specialty: null, wilaya: null });
                onSearch(query, { specialty: null, wilaya: null });
              }}
              className="text-sm text-health-600 hover:text-health-800 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {showFilters && (
        <div className={cn(
          "mt-3 p-4 bg-white border border-gray-200 rounded-xl shadow-subtle",
          "animate-in slide-in-from-top-5 duration-300"
        )}>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <SpecialtyFilter 
                  selectedSpecialty={filters.specialty || null}
                  onSelectSpecialty={(specialty) => updateFilters('specialty', specialty)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wilaya</label>
                <WilayaFilter 
                  selectedWilaya={filters.wilaya || null}
                  onSelectWilaya={(wilaya) => updateFilters('wilaya', wilaya)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onSearch(query, filters);
                  setShowFilters(false);
                }}
                className="px-4 py-2 bg-health-600 text-white rounded-lg text-sm font-medium hover:bg-health-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
