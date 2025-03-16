
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';

// Contexts
import { AuthProvider } from '@/contexts/AuthContext';

// Pages
import Index from '@/pages/Index';
import DoctorsList from '@/pages/DoctorsList';
import DoctorProfile from '@/pages/DoctorProfile';
import CreateDoctorProfile from './pages/CreateDoctorProfile';
import EditDoctorProfile from './pages/EditDoctorProfile';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/doctors" element={<DoctorsList />} />
            <Route path="/doctors/:id" element={<DoctorProfile />} />
            <Route path="/doctors/create" element={<CreateDoctorProfile />} />
            <Route path="/doctors/:id/edit" element={<EditDoctorProfile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
