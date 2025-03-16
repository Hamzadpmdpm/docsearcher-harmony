
import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { wilayas } from '@/data/wilaya';

interface WilayaFilterProps {
  selectedWilaya: string | null;
  onSelectWilaya: (wilaya: string | null) => void;
}

const WilayaFilter = ({ selectedWilaya, onSelectWilaya }: WilayaFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Filter wilayas based on search query
  const filteredWilayas = wilayas.filter(wilaya => 
    wilaya.toLowerCase().includes(searchQuery.toLowerCase())
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
  
  const handleSelect = (wilaya: string) => {
    onSelectWilaya(wilaya === selectedWilaya ? null : wilaya);
    setIsOpen(false);
  };
  
  const handleClear = () => {
    onSelectWilaya(null);
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
          {selectedWilaya ? (
            <>Wilaya: <span className="text-health-600">{selectedWilaya}</span></>
          ) : (
            "All Wilayas"
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
              placeholder="Search wilayas..."
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
                !selectedWilaya && "text-health-600 font-medium bg-health-50"
              )}
              onClick={handleClear}
            >
              {!selectedWilaya && (
                <Check size={16} className="mr-2 flex-shrink-0" />
              )}
              <span className={!selectedWilaya ? "ml-2" : ""}>All Wilayas</span>
            </button>
            {filteredWilayas.map((wilaya) => (
              <button
                key={wilaya}
                className={cn(
                  "w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center",
                  selectedWilaya === wilaya && "text-health-600 font-medium bg-health-50"
                )}
                onClick={() => handleSelect(wilaya)}
              >
                {selectedWilaya === wilaya && (
                  <Check size={16} className="mr-2 flex-shrink-0" />
                )}
                <span className={selectedWilaya === wilaya ? "ml-2" : ""}>{wilaya}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WilayaFilter;
