
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, Award, UserCheck } from 'lucide-react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import AnimatedTransition from '@/components/AnimatedTransition';
import { specialties } from '@/data/doctors';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();
  
  const handleSearch = (query: string) => {
    navigate(`/doctors?search=${encodeURIComponent(query)}`);
  };
  
  const handleSpecialtyClick = (specialty: string) => {
    navigate(`/doctors?specialty=${encodeURIComponent(specialty)}`);
  };
  
  // Get a subset of specialties for the quick access section
  const featuredSpecialties = specialties.slice(0, 6);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 md:px-12 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedTransition animation="fade" duration="slow">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find the Right Doctor for Your Health Needs
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                Connect with top healthcare professionals specializing in various fields of medicine.
              </p>
            </div>
          </AnimatedTransition>
          
          <AnimatedTransition animation="slide-up" delay={300} className="mt-10">
            <SearchBar 
              onSearch={handleSearch} 
              className="mx-auto"
            />
          </AnimatedTransition>
          
          <AnimatedTransition animation="fade" delay={600} className="mt-12">
            <div className="flex flex-wrap justify-center gap-4">
              {featuredSpecialties.map((specialty, index) => (
                <SpecialtyButton 
                  key={specialty} 
                  specialty={specialty} 
                  onClick={() => handleSpecialtyClick(specialty)}
                  delay={700 + (index * 100)}
                />
              ))}
            </div>
          </AnimatedTransition>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-6 bg-health-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <AnimatedTransition>
              <h2 className="text-3xl font-bold text-gray-900">Why Choose Our Platform</h2>
            </AnimatedTransition>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<UserCheck className="text-health-600" size={24} />}
              title="Verified Professionals"
              description="All healthcare providers are verified and credentialed to ensure quality care."
              delay={200}
            />
            <FeatureCard 
              icon={<Search className="text-health-600" size={24} />}
              title="Easy Search"
              description="Find specialists by name, specialty, location, or availability with our powerful search."
              delay={400}
            />
            <FeatureCard 
              icon={<Award className="text-health-600" size={24} />}
              title="Top-Rated Doctors"
              description="Browse reviews and ratings to find the most highly recommended healthcare providers."
              delay={600}
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedTransition>
            <div className="bg-health-600 rounded-2xl overflow-hidden shadow-elevated">
              <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
                <div className="text-white mb-8 md:mb-0 md:mr-8">
                  <h2 className="text-3xl font-bold">Find Your Doctor Today</h2>
                  <p className="mt-4 text-health-100 max-w-xl">
                    Browse our comprehensive directory of healthcare professionals and find the right specialist for your needs.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/doctors')}
                  className="px-8 py-3 bg-white text-health-700 rounded-lg font-medium hover:bg-health-50 transition-colors shadow-sm flex items-center"
                >
                  <Heart size={18} className="mr-2" />
                  Browse All Doctors
                </button>
              </div>
            </div>
          </AnimatedTransition>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 px-6 bg-gray-50 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} HealthCare Directory. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

interface SpecialtyButtonProps {
  specialty: string;
  onClick: () => void;
  delay: number;
}

const SpecialtyButton = ({ specialty, onClick, delay }: SpecialtyButtonProps) => (
  <AnimatedTransition animation="scale" delay={delay}>
    <button
      onClick={onClick}
      className="px-5 py-2 bg-white rounded-full border border-gray-200 shadow-subtle hover:shadow-elevated hover:border-health-200 transition-all duration-300 text-sm font-medium text-gray-800"
    >
      {specialty}
    </button>
  </AnimatedTransition>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => (
  <AnimatedTransition animation="slide-up" delay={delay}>
    <div className="bg-white rounded-xl p-6 shadow-subtle h-full">
      <div className="w-12 h-12 rounded-full bg-health-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </AnimatedTransition>
);

export default Index;
