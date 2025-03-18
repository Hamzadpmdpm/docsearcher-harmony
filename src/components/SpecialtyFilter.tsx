
import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSpecialties } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface SpecialtyFilterProps {
  selectedSpecialty: string | null;
  onSelectSpecialty: (specialty: string | null) => void;
}

const SpecialtyFilter = ({ selectedSpecialty, onSelectSpecialty }: SpecialtyFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: getSpecialties,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
  
  // Filter specialties based on search query
  const filteredSpecialties = specialties.filter(specialty => 
    specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };
  
  const handleSelect = (specialty: string) => {
    onSelectSpecialty(specialty === selectedSpecialty ? null : specialty);
    setIsOpen(false);
  };
  
  const handleClear = () => {
    onSelectSpecialty(null);
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left",
          "bg-white border border-gray-200 rounded-lg shadow-subtle",
          "hover:bg-gray-50 transition-colors duration-200",
          isOpen && "ring-2 ring-health-200"
        )}
      >
        <span>
          {selectedSpecialty ? (
            <>Specialty: <span className="text-health-600">{selectedSpecialty}</span></>
          ) : (
            "All Specialties"
          )}
        </span>
        <svg
          className={cn(
            "w-5 h-5 transition-transform ml-2",
            isOpen && "transform rotate-180"
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-elevated overflow-hidden animate-scale-in origin-top">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-health-200"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            <button
              className={cn(
                "w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center",
                !selectedSpecialty && "text-health-600 font-medium bg-health-50"
              )}
              onClick={handleClear}
            >
              {!selectedSpecialty && (
                <Check size={16} className="mr-2 flex-shrink-0" />
              )}
              <span className={!selectedSpecialty ? "ml-2" : ""}>All Specialties</span>
            </button>
            {filteredSpecialties.map((specialty) => (
              <button
                key={specialty}
                className={cn(
                  "w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center",
                  selectedSpecialty === specialty && "text-health-600 font-medium bg-health-50"
                )}
                onClick={() => handleSelect(specialty)}
              >
                {selectedSpecialty === specialty && (
                  <Check size={16} className="mr-2 flex-shrink-0" />
                )}
                <span className={selectedSpecialty === specialty ? "ml-2" : ""}>{specialty}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialtyFilter;
