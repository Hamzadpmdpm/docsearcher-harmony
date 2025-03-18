
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Create doctor profile component
export default function CreateDoctorProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Function to handle redirection to the main create doctor page
  const handleRedirect = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        toast.error('You must be logged in to create a doctor profile');
        return;
      }
      
      window.location.href = '/doctors/create';
    } catch (error) {
      console.error('Error creating doctor profile:', error);
      toast.error('Failed to verify doctor profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Create Doctor Profile</h1>
      <p className="mb-6 text-gray-600">
        Create your professional doctor profile to be listed in our Doctal directory.
      </p>
      
      <button 
        onClick={handleRedirect}
        className="px-4 py-2 bg-health-600 text-white rounded hover:bg-health-700 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Create Profile'}
      </button>
    </div>
  );
}
