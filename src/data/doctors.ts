export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  subspecialties?: string[];
  hospital: string;
  rating: number;
  experience: number;
  education: string[];
  bio: string;
  languages: string[];
  acceptingNewPatients: boolean;
  image: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
}

export const specialties = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Urology'
];

export const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    subspecialties: ['Interventional Cardiology', 'Heart Failure'],
    hospital: 'Central Medical Center',
    rating: 4.9,
    experience: 15,
    education: [
      'Harvard Medical School, MD',
      'Johns Hopkins Hospital, Residency',
      'Cleveland Clinic, Fellowship'
    ],
    bio: 'Dr. Johnson is a board-certified cardiologist specializing in the diagnosis and treatment of heart conditions. With over 15 years of experience, she is dedicated to providing personalized care using the latest medical advances.',
    languages: ['English', 'Spanish'],
    acceptingNewPatients: true,
    image: '/placeholder.svg',
    contact: {
      phone: '(555) 123-4567',
      email: 'sarah.johnson@centralmed.org',
      address: '123 Medical Plaza, Suite 300, Boston, MA 02115'
    }
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Neurology',
    subspecialties: ['Stroke', 'Neuro-oncology'],
    hospital: 'University Hospital',
    rating: 4.8,
    experience: 12,
    education: [
      'Stanford University School of Medicine, MD',
      'UCSF Medical Center, Residency',
      'Mayo Clinic, Fellowship'
    ],
    bio: 'Dr. Chen is a neurologist who specializes in the treatment of neurological disorders. He has particular expertise in stroke management and neuro-oncology, bringing advanced techniques to his practice.',
    languages: ['English', 'Mandarin'],
    acceptingNewPatients: true,
    image: '/placeholder.svg',
    contact: {
      phone: '(555) 234-5678',
      email: 'michael.chen@universityhosp.org',
      address: '456 University Blvd, San Francisco, CA 94143'
    }
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Dermatology',
    subspecialties: ['Cosmetic Dermatology', 'Pediatric Dermatology'],
    hospital: 'Westside Medical Group',
    rating: 4.7,
    experience: 10,
    education: [
      'University of Michigan Medical School, MD',
      'NYU Langone Health, Residency',
      'University of California, Los Angeles, Fellowship'
    ],
    bio: 'Dr. Rodriguez is a dermatologist who treats conditions affecting the skin, hair, and nails. She has special interest in cosmetic dermatology and treating skin conditions in children.',
    languages: ['English', 'Spanish'],
    acceptingNewPatients: true,
    image: '/placeholder.svg',
    contact: {
      phone: '(555) 345-6789',
      email: 'emily.rodriguez@westsidemg.org',
      address: '789 Westside Drive, Los Angeles, CA 90095'
    }
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialty: 'Orthopedics',
    subspecialties: ['Sports Medicine', 'Joint Replacement'],
    hospital: 'Sports Medicine & Orthopedic Center',
    rating: 4.9,
    experience: 18,
    education: [
      'Duke University School of Medicine, MD',
      'Hospital for Special Surgery, Residency',
      'Andrews Sports Medicine & Orthopedic Center, Fellowship'
    ],
    bio: 'Dr. Wilson is an orthopedic surgeon specializing in sports-related injuries and joint replacement. He has worked with professional athletes and brings that expertise to all his patients.',
    languages: ['English'],
    acceptingNewPatients: true,
    image: '/placeholder.svg',
    contact: {
      phone: '(555) 456-7890',
      email: 'james.wilson@sportsortho.org',
      address: '1010 Sports Medicine Way, Birmingham, AL 35205'
    }
  },
  {
    id: '5',
    name: 'Dr. Olivia Taylor',
    specialty: 'Pediatrics',
    subspecialties: ['Neonatal Care', 'Pediatric Infectious Disease'],
    hospital: "Children's Memorial Hospital",
    rating: 4.9,
    experience: 14,
    education: [
      'Washington University School of Medicine, MD',
      "Boston Children's Hospital, Residency",
      "Children's Hospital of Philadelphia, Fellowship"
    ],
    bio: "Dr. Taylor is a pediatrician with expertise in newborn care and infectious diseases in children. She is passionate about promoting children's health through preventive care and education.",
    languages: ['English', 'French'],
    acceptingNewPatients: true,
    image: '/placeholder.svg',
    contact: {
      phone: '(555) 567-8901',
      email: 'olivia.taylor@childrenshosp.org',
      address: '2020 Children\'s Way, Chicago, IL 60614'
    }
  },
  {
    id: '6',
    name: 'Dr. Robert Patel',
    specialty: 'Gastroenterology',
    subspecialties: ['Inflammatory Bowel Disease', 'Hepatology'],
    hospital: 'Digestive Health Institute',
    rating: 4.7,
    experience: 16,
    education: [
      'Yale School of Medicine, MD',
      'Massachusetts General Hospital, Residency',
      'Cleveland Clinic, Fellowship'
    ],
    bio: 'Dr. Patel is a gastroenterologist who diagnoses and treats conditions of the digestive system. He has particular interest in inflammatory bowel disease and liver conditions.',
    languages: ['English', 'Hindi', 'Gujarati'],
    acceptingNewPatients: false,
    image: '/placeholder.svg',
    contact: {
      phone: '(555) 678-9012',
      email: 'robert.patel@digestivehealth.org',
      address: '3030 Digestive Way, Cleveland, OH 44195'
    }
  },
  {
    id: '7',
    name: 'Dr. Sophia Kim',
    specialty: 'Obstetrics & Gynecology',
    subspecialties: ['High-Risk Pregnancy', 'Minimally Invasive Surgery'],
    hospital: "Women's Health Center",
    rating: 4.8,
    experience: 11,
    education: [
      'Columbia University College of Physicians and Surgeons, MD',
      'Northwestern Memorial Hospital, Residency',
      'University of Pennsylvania Health System, Fellowship'
    ],
    bio: "Dr. Kim is an obstetrician-gynecologist providing comprehensive women's healthcare. She specializes in managing high-risk pregnancies and performing minimally invasive gynecologic surgeries.",
    languages: ['English', 'Korean'],
    acceptingNewPatients: true,
    image: '/placeholder.svg',
    contact: {
      phone: '(555) 789-0123',
      email: 'sophia.kim@womenshealth.org',
      address: '4040 Women\'s Health Blvd, New York, NY 10032'
    }
  },
  {
    id: '8',
    name: 'Dr. David Mitchell',
    specialty: 'Psychiatry',
    subspecialties: ['Mood Disorders', 'Anxiety Disorders'],
    hospital: 'Behavioral Health Institute',
    rating: 4.6,
    experience: 13,
    education: [
      'University of California, San Francisco, MD',
      'Massachusetts General Hospital, Residency',
      'McLean Hospital, Fellowship'
    ],
    bio: 'Dr. Mitchell is a psychiatrist who specializes in the treatment of mood and anxiety disorders. He takes an integrative approach to mental health, combining medication management with psychotherapy when appropriate.',
    languages: ['English'],
    acceptingNewPatients: true,
    image: '/placeholder.svg',
    contact: {
      phone: '(555) 890-1234',
      email: 'david.mitchell@behavioralhealth.org',
      address: '5050 Behavioral Health Drive, Boston, MA 02114'
    }
  },
  {
    id: '9',
    name: 'Dr. Natasha Brown',
    specialty: 'Endocrinology',
    subspecialties: ['Diabetes Management', 'Thyroid Disorders'],
    hospital: 'Endocrine & Metabolism Center',
    rating: 4.8,
    experience: 14,
    education: [
      'University of Chicago Pritzker School of Medicine, MD',
      'Duke University Medical Center, Residency',
      'Mayo Clinic, Fellowship'
    ],
    bio: 'Dr. Brown is an endocrinologist who treats hormonal disorders. She is particularly interested in diabetes management and thyroid conditions, focusing on helping patients achieve hormonal balance and improved quality of life.',
    languages: ['English'],
    acceptingNewPatients: true,
    image: '/placeholder.svg',
    contact: {
      phone: '(555) 901-2345',
      email: 'natasha.brown@endocrine.org',
      address: '6060 Endocrine Avenue, Rochester, MN 55905'
    }
  },
  {
    id: '10',
    name: 'Dr. Andrew Lee',
    specialty: 'Ophthalmology',
    subspecialties: ['Cataract Surgery', 'Retinal Diseases'],
    hospital: 'Vision Care Institute',
    rating: 4.9,
    experience: 17,
    education: [
      'Johns Hopkins University School of Medicine, MD',
      'Wilmer Eye Institute, Residency',
      'Bascom Palmer Eye Institute, Fellowship'
    ],
    bio: 'Dr. Lee is an ophthalmologist who diagnoses and treats diseases of the eye. He specializes in cataract surgery and management of retinal conditions, with a commitment to preserving and improving vision.',
    languages: ['English', 'Cantonese'],
    acceptingNewPatients: true,
    image: '/placeholder.svg',
    contact: {
      phone: '(555) 012-3456',
      email: 'andrew.lee@visioncare.org',
      address: '7070 Vision Lane, Miami, FL 33136'
    }
  },
  {
    id: '11',
    name: 'Dr. Rachel Green',
    specialty: 'Pulmonology',
    subspecialties: ['Asthma', 'Interstitial Lung Disease'],
    hospital: 'Respiratory Care Center',
    rating: 4.7,
    experience: 12,
    education: [
      'Weill Cornell Medical College, MD',
      'NewYork-Presbyterian Hospital, Residency',
      'National Jewish Health, Fellowship'
    ],
    bio: 'Dr. Green is a pulmonologist who diagnoses and treats diseases of the respiratory system. She has expertise in managing asthma and interstitial lung diseases, aiming to help patients breathe easier and improve their quality of life.',
    languages: ['English'],
    acceptingNewPatients: true,
    image: '/placeholder.svg',
    contact: {
      phone: '(555) 123-4567',
      email: 'rachel.green@respiratorycare.org',
      address: '8080 Breathing Blvd, Denver, CO 80206'
    }
  },
  {
    id: '12',
    name: 'Dr. Thomas Walker',
    specialty: 'Oncology',
    subspecialties: ['Breast Cancer', 'Lung Cancer'],
    hospital: 'Comprehensive Cancer Center',
    rating: 4.9,
    experience: 20,
    education: [
      'University of Pennsylvania School of Medicine, MD',
      'Memorial Sloan Kettering Cancer Center, Residency',
      'Dana-Farber Cancer Institute, Fellowship'
    ],
    bio: 'Dr. Walker is a medical oncologist who specializes in the treatment of breast and lung cancers. With 20 years of experience, he is committed to providing compassionate care and access to the latest cancer treatments.',
    languages: ['English'],
    acceptingNewPatients: true,
    image: '/placeholder.svg',
    contact: {
      phone: '(555) 234-5678',
      email: 'thomas.walker@cancercenter.org',
      address: '9090 Oncology Drive, Boston, MA 02215'
    }
  }
];
