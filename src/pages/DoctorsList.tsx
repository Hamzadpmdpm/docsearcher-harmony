
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlusCircle, Filter } from 'lucide-react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import DoctorCard from '@/components/DoctorCard';
import SpecialtyFilter from '@/components/SpecialtyFilter';
import AnimatedTransition from '@/components/AnimatedTransition';
import { getDoctors } from '@/lib/api';
import { SupabaseDoctor } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DoctorsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get initial filters from URL params
  useEffect(() => {
    const specialtyParam = searchParams.get('specialty');
    const searchParam = searchParams.get('search');
    const cityParam = searchParams.get('city');
    const stateParam = searchParams.get('state');
    
    if (specialtyParam) {
      setSelectedSpecialty(specialtyParam);
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }

    if (cityParam) {
      setCityFilter(cityParam);
    }

    if (stateParam) {
      setStateFilter(stateParam);
    }
  }, [searchParams]);
  
  // Fetch doctors with react-query
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors', selectedSpecialty, searchQuery, cityFilter, stateFilter],
    queryFn: () => getDoctors({ 
      specialty: selectedSpecialty, 
      searchQuery: searchQuery,
      city: cityFilter,
      state: stateFilter
    }),
  });
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateSearchParams(query, selectedSpecialty, cityFilter, stateFilter);
  };
  
  const handleSelectSpecialty = (specialty: string | null) => {
    setSelectedSpecialty(specialty);
    updateSearchParams(searchQuery, specialty, cityFilter, stateFilter);
  };

  const handleCityChange = (city: string) => {
    setCityFilter(city);
    updateSearchParams(searchQuery, selectedSpecialty, city, stateFilter);
  };

  const handleStateChange = (state: string) => {
    setStateFilter(state);
    updateSearchParams(searchQuery, selectedSpecialty, cityFilter, state);
  };
  
  const updateSearchParams = (search: string, specialty: string | null, city: string, state: string) => {
    const newParams = new URLSearchParams();
    
    if (search) {
      newParams.set('search', search);
    }
    
    if (specialty) {
      newParams.set('specialty', specialty);
    }

    if (city) {
      newParams.set('city', city);
    }

    if (state) {
      newParams.set('state', state);
    }
    
    setSearchParams(newParams);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedTransition className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Doctor Directory</h1>
          </AnimatedTransition>
          
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-start">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search doctors by name, specialty or hospital..." 
              variant="minimal"
              className="flex-grow"
            />
            
            <Button 
              variant="outline" 
              onClick={toggleFilters} 
              className="flex items-center gap-2 w-full md:w-auto"
            >
              <Filter size={16} />
              Filters
            </Button>
          </div>

          {showFilters && (
            <AnimatedTransition animation="slide-down" className="mb-6 p-4 bg-gray-50 rounded-lg shadow-subtle">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  <SpecialtyFilter 
                    selectedSpecialty={selectedSpecialty} 
                    onSelectSpecialty={handleSelectSpecialty} 
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <Input
                    id="city"
                    placeholder="Filter by city"
                    value={cityFilter}
                    onChange={(e) => handleCityChange(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <Input
                    id="state"
                    placeholder="Filter by state"
                    value={stateFilter}
                    onChange={(e) => handleStateChange(e.target.value)}
                  />
                </div>
              </div>
            </AnimatedTransition>
          )}
          
          <div className="mb-4 flex justify-between items-center">
            <AnimatedTransition animation="slide-up" delay={100}>
              {isLoading ? (
                <p className="text-gray-600">Loading doctors...</p>
              ) : (
                <p className="text-gray-600">
                  {doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'} found
                  {selectedSpecialty && ` in ${selectedSpecialty}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                  {cityFilter && ` in ${cityFilter}`}
                  {stateFilter && `, ${stateFilter}`}
                </p>
              )}
            </AnimatedTransition>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          ) : doctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor, index) => (
                <AnimatedTransition key={doctor.id} animation="scale" delay={150 + (index * 50)}>
                  <DoctorCard doctor={doctor} index={index} />
                </AnimatedTransition>
              ))}
            </div>
          ) : (
            <AnimatedTransition animation="fade" className="mt-10 text-center py-16">
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
                <PlusCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Doctors Found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  We couldn't find any doctors matching your search criteria. Please try different keywords or filters.
                </p>
              </div>
            </AnimatedTransition>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} HealthCare Directory. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default DoctorsList;
