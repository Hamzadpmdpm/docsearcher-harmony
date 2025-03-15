
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, PlusCircle, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import DoctorCard from '@/components/DoctorCard';
import SpecialtyFilter from '@/components/SpecialtyFilter';
import AnimatedTransition from '@/components/AnimatedTransition';
import { doctors } from '@/data/doctors';
import { cn } from '@/lib/utils';

const DoctorsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredDoctors, setFilteredDoctors] = useState(doctors);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get initial filters from URL params
  useEffect(() => {
    const specialtyParam = searchParams.get('specialty');
    const searchParam = searchParams.get('search');
    
    if (specialtyParam) {
      setSelectedSpecialty(specialtyParam);
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    applyFilters(searchParam || '', specialtyParam);
  }, [searchParams]);
  
  const applyFilters = (search: string, specialty: string | null) => {
    let result = [...doctors];
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(doctor => 
        doctor.name.toLowerCase().includes(lowerSearch) ||
        doctor.specialty.toLowerCase().includes(lowerSearch) ||
        doctor.hospital.toLowerCase().includes(lowerSearch) ||
        doctor.subspecialties?.some(sub => sub.toLowerCase().includes(lowerSearch))
      );
    }
    
    if (specialty) {
      result = result.filter(doctor => doctor.specialty === specialty);
    }
    
    setFilteredDoctors(result);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateSearchParams(query, selectedSpecialty);
    applyFilters(query, selectedSpecialty);
  };
  
  const handleSelectSpecialty = (specialty: string | null) => {
    setSelectedSpecialty(specialty);
    updateSearchParams(searchQuery, specialty);
    applyFilters(searchQuery, specialty);
  };
  
  const updateSearchParams = (search: string, specialty: string | null) => {
    const newParams = new URLSearchParams();
    
    if (search) {
      newParams.set('search', search);
    }
    
    if (specialty) {
      newParams.set('specialty', specialty);
    }
    
    setSearchParams(newParams);
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
            
            <div className="w-full md:w-64">
              <SpecialtyFilter 
                selectedSpecialty={selectedSpecialty} 
                onSelectSpecialty={handleSelectSpecialty} 
              />
            </div>
          </div>
          
          <div className="mb-4 flex justify-between items-center">
            <AnimatedTransition animation="slide-up" delay={100}>
              <p className="text-gray-600">
                {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found
                {selectedSpecialty && ` in ${selectedSpecialty}`}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </AnimatedTransition>
          </div>
          
          {filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor, index) => (
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
