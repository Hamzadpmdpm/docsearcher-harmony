
export interface SupabaseDoctor {
  id: string;
  name: string;
  specialty: string;
  subspecialties: string[] | null;
  hospital: string;
  rating: number;
  experience: number;
  education: string[];
  bio: string;
  languages: string[];
  accepting_new_patients: boolean;
  image: string;
  contact: {
    phone: string;
    email: string;
    address: string;
    city?: string;
    state?: string;
  };
  created_at: string;
  updated_at: string;
  created_by_user_id?: string;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  user_type: 'patient' | 'doctor';
  created_at: string;
  updated_at: string;
}

export interface DoctorVerification {
  id: string;
  doctor_id: string;
  user_id: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorRating {
  id: string;
  doctor_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}
