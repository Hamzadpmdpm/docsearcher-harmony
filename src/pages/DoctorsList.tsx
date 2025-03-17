
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlusCircle, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import SearchBar, { SearchFilters } from '@/components/SearchBar';
import DoctorCard from '@/components/DoctorCard';
import AnimatedTransition from '@/components/AnimatedTransition';
import { getDoctors } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

const DoctorsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  
  // Get initial filters from URL params
  useEffect(() => {
    const specialtyParam = searchParams.get('specialty');
    const searchParam = searchParams.get('search');
    const cityParam = searchParams.get('city');
    const stateParam = searchParams.get('state');
    const wilayaParam = searchParams.get('wilaya');
    
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
    
    if (wilayaParam) {
      setSelectedWilaya(wilayaParam);
    }
  }, [searchParams]);
  
  // Fetch doctors with react-query
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors', selectedSpecialty, searchQuery, cityFilter, stateFilter, selectedWilaya],
    queryFn: () => getDoctors({ 
      specialty: selectedSpecialty, 
      searchQuery: searchQuery,
      city: cityFilter,
      state: stateFilter,
      wilaya: selectedWilaya
    }),
  });
  
  const handleSearch = (query: string, filters?: SearchFilters) => {
    setSearchQuery(query);
    
    if (filters) {
      setSelectedSpecialty(filters.specialty || null);
      setSelectedWilaya(filters.wilaya || null);
    }
    
    updateSearchParams(
      query, 
      filters?.specialty || selectedSpecialty, 
      cityFilter, 
      stateFilter,
      filters?.wilaya || selectedWilaya
    );
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty(null);
    setSelectedWilaya(null);
    setCityFilter('');
    setStateFilter('');
    setSearchParams(new URLSearchParams());
  };
  
  const updateSearchParams = (
    search: string, 
    specialty: string | null, 
    city: string, 
    state: string,
    wilaya: string | null
  ) => {
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
    
    if (wilaya) {
      newParams.set('wilaya', wilaya);
    }
    
    setSearchParams(newParams);
  };

  const hasActiveFilters = searchQuery || selectedSpecialty || selectedWilaya || cityFilter || stateFilter;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedTransition className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Doctor Directory</h1>
          </AnimatedTransition>
          
          <div className="mb-8 max-w-3xl mx-auto">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search doctors by name, specialty or hospital..." 
              className="w-full"
              initialFilters={{
                specialty: selectedSpecialty,
                wilaya: selectedWilaya
              }}
            />
            
            {hasActiveFilters && (
              <div className="mt-2 flex justify-end">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-600 flex items-center gap-1"
                >
                  <XCircle size={14} />
                  Clear filters
                </Button>
              </div>
            )}
          </div>
          
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
                  {selectedWilaya && `, ${selectedWilaya}`}
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
