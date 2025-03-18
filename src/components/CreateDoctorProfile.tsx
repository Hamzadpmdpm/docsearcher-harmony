
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { hospitalPrefixes } from '@/data/hospitalPrefixes';
import { wilayas } from '@/data/wilaya';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CreateDoctorProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [selectedHospitalPrefix, setSelectedHospitalPrefix] = useState<string>('');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');

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
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Type</label>
          <Select 
            onValueChange={setSelectedHospitalPrefix}
            value={selectedHospitalPrefix}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select hospital type" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-72">
                {hospitalPrefixes.map(({ prefix, description }) => (
                  <SelectItem key={prefix} value={prefix}>
                    <div className="flex flex-col">
                      <span className="font-medium">{prefix}</span>
                      <span className="text-sm text-gray-500">{description}</span>
                    </div>
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wilaya</label>
          <Select 
            onValueChange={setSelectedWilaya}
            value={selectedWilaya}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select wilaya" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-72">
                {wilayas.map((wilaya) => (
                  <SelectItem key={wilaya} value={wilaya}>
                    {wilaya}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <button 
        onClick={handleRedirect}
        className="mt-6 px-4 py-2 bg-health-600 text-white rounded hover:bg-health-700 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Continue'}
      </button>
    </div>
  );
}
