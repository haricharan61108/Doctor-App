// Demo data for patient components

export interface HealthStats {
  blood_group: string;
  prescription_count: number;
  appointment_count: number;
  allergies: string[];
  chronic_conditions: string[];
  age: number;
  sex: string;
  weight?: string;
  height?: string;
  bmi?: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  prescription_number: string;
  date: string;
  clinic: string;
  symptoms: string[];
  medicines: Medicine[];
  prescriber_name: string;
  status: "pending" | "approved" | "dispensed" | "completed";
  notes?: string;
}

export interface Appointment {
  id: string;
  doctor_name: string;
  doctor_specialization: string;
  date: string;
  time: string;
  reason: string;
  status: "scheduled" | "completed" | "in-progress" | "cancelled";
  location?: string;
  type?: "in-person" | "video" | "phone";
}

export interface Doctor {
  id: string;
  name: string;
  email?: string;
  specialization: string;
  avatarUrl?: string | null;
  available_slots?: string[];
  rating?: number;
  image?: string;
  _count?: {
    appointments: number;
  };
}

// Mock patient health stats
export const mockHealthStats: HealthStats = {
  blood_group: "O+",
  prescription_count: 5,
  appointment_count: 8,
  allergies: ["Penicillin", "Peanuts"],
  chronic_conditions: ["Asthma"],
  age: 21,
  sex: "Male",
  weight: "70 kg",
  height: "175 cm",
  bmi: "22.9"
};

// Mock prescriptions data
export const mockPrescriptions: Prescription[] = [
  {
    id: "P001",
    prescription_number: "RX-2025-001",
    date: "2025-12-15",
    clinic: "University Health Center",
    symptoms: ["Fever", "Cough", "Sore throat"],
    medicines: [
      {
        name: "Amoxicillin",
        dosage: "500mg",
        frequency: "3 times daily",
        duration: "7 days"
      },
      {
        name: "Paracetamol",
        dosage: "650mg",
        frequency: "As needed (max 4 times daily)",
        duration: "5 days"
      },
      {
        name: "Cough Syrup",
        dosage: "10ml",
        frequency: "Twice daily",
        duration: "7 days"
      }
    ],
    prescriber_name: "Dr. Sarah Williams",
    status: "dispensed",
    notes: "Complete the full course of antibiotics even if symptoms improve"
  },
  {
    id: "P002",
    prescription_number: "RX-2025-002",
    date: "2025-12-10",
    clinic: "University Health Center",
    symptoms: ["Asthma flare-up", "Shortness of breath"],
    medicines: [
      {
        name: "Albuterol Inhaler",
        dosage: "90mcg",
        frequency: "2 puffs every 4-6 hours as needed",
        duration: "30 days"
      },
      {
        name: "Fluticasone Inhaler",
        dosage: "110mcg",
        frequency: "2 puffs twice daily",
        duration: "30 days"
      }
    ],
    prescriber_name: "Dr. James Anderson",
    status: "approved",
    notes: "Use rescue inhaler before exercise"
  },
  {
    id: "P003",
    prescription_number: "RX-2025-003",
    date: "2025-12-05",
    clinic: "University Health Center",
    symptoms: ["Headache", "Eye strain", "Neck pain"],
    medicines: [
      {
        name: "Ibuprofen",
        dosage: "400mg",
        frequency: "Twice daily with food",
        duration: "5 days"
      }
    ],
    prescriber_name: "Dr. Sarah Williams",
    status: "completed",
    notes: "Recommend ergonomic workstation assessment"
  },
  {
    id: "P004",
    prescription_number: "RX-2025-004",
    date: "2025-11-28",
    clinic: "University Health Center",
    symptoms: ["Seasonal allergies", "Runny nose", "Sneezing"],
    medicines: [
      {
        name: "Cetirizine",
        dosage: "10mg",
        frequency: "Once daily at bedtime",
        duration: "30 days"
      },
      {
        name: "Nasal Spray",
        dosage: "2 sprays",
        frequency: "Twice daily",
        duration: "14 days"
      }
    ],
    prescriber_name: "Dr. Maria Garcia",
    status: "dispensed"
  },
  {
    id: "P005",
    prescription_number: "RX-2025-005",
    date: "2025-11-20",
    clinic: "University Health Center",
    symptoms: ["Vitamin D deficiency", "Fatigue"],
    medicines: [
      {
        name: "Vitamin D3",
        dosage: "2000 IU",
        frequency: "Once daily with food",
        duration: "90 days"
      }
    ],
    prescriber_name: "Dr. Sarah Williams",
    status: "dispensed",
    notes: "Recheck vitamin D levels after 3 months"
  }
];

// Mock appointments data
export const mockAppointments: Appointment[] = [
  {
    id: "A001",
    doctor_name: "Dr. Sarah Williams",
    doctor_specialization: "General Medicine",
    date: "2025-12-22",
    time: "10:00 AM",
    reason: "Annual physical examination",
    status: "scheduled",
    location: "Room 203, Health Center",
    type: "in-person"
  },
  {
    id: "A002",
    doctor_name: "Dr. James Anderson",
    doctor_specialization: "Cardiology",
    date: "2025-12-20",
    time: "02:30 PM",
    reason: "Asthma follow-up consultation",
    status: "scheduled",
    location: "Room 105, Cardiology Wing",
    type: "in-person"
  },
  {
    id: "A003",
    doctor_name: "Dr. Maria Garcia",
    doctor_specialization: "Dermatology",
    date: "2025-12-25",
    time: "11:00 AM",
    reason: "Skin rash examination",
    status: "scheduled",
    location: "Video Call",
    type: "video"
  },
  {
    id: "A004",
    doctor_name: "Dr. Sarah Williams",
    doctor_specialization: "General Medicine",
    date: "2025-12-15",
    time: "09:00 AM",
    reason: "Flu symptoms consultation",
    status: "completed",
    location: "Room 203, Health Center",
    type: "in-person"
  },
  {
    id: "A005",
    doctor_name: "Dr. Robert Chen",
    doctor_specialization: "Orthopedics",
    date: "2025-12-18",
    time: "03:00 PM",
    reason: "Knee pain assessment",
    status: "in-progress",
    location: "Room 301, Orthopedics",
    type: "in-person"
  },
  {
    id: "A006",
    doctor_name: "Dr. Emily Thompson",
    doctor_specialization: "Psychiatry",
    date: "2025-12-10",
    time: "04:00 PM",
    reason: "Mental health check-in",
    status: "completed",
    location: "Video Call",
    type: "video"
  },
  {
    id: "A007",
    doctor_name: "Dr. James Anderson",
    doctor_specialization: "Cardiology",
    date: "2025-11-28",
    time: "10:30 AM",
    reason: "Asthma diagnosis",
    status: "completed",
    location: "Room 105, Cardiology Wing",
    type: "in-person"
  },
  {
    id: "A008",
    doctor_name: "Dr. Sarah Williams",
    doctor_specialization: "General Medicine",
    date: "2025-11-15",
    time: "01:00 PM",
    reason: "Vitamin deficiency consultation",
    status: "completed",
    location: "Room 203, Health Center",
    type: "in-person"
  }
];

// Mock doctors data
export const mockDoctors: Doctor[] = [
  {
    id: "D001",
    name: "Dr. Sarah Williams",
    specialization: "General Medicine",
    available_slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
    rating: 4.8
  },
  {
    id: "D002",
    name: "Dr. James Anderson",
    specialization: "Cardiology",
    available_slots: ["10:00 AM", "11:00 AM", "02:30 PM", "03:30 PM"],
    rating: 4.9
  },
  {
    id: "D003",
    name: "Dr. Maria Garcia",
    specialization: "Dermatology",
    available_slots: ["09:30 AM", "11:00 AM", "01:00 PM", "02:30 PM", "04:00 PM"],
    rating: 4.7
  },
  {
    id: "D004",
    name: "Dr. Robert Chen",
    specialization: "Orthopedics",
    available_slots: ["09:00 AM", "10:30 AM", "01:30 PM", "03:00 PM"],
    rating: 4.8
  },
  {
    id: "D005",
    name: "Dr. Emily Thompson",
    specialization: "Psychiatry",
    available_slots: ["10:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    rating: 4.9
  },
  {
    id: "D006",
    name: "Dr. Michael Brown",
    specialization: "ENT (Ear, Nose, Throat)",
    available_slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"],
    rating: 4.6
  }
];

// Medical records mock data
export interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  title: string;
  doctor: string;
  summary: string;
  attachments?: string[];
}

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: "MR001",
    date: "2025-12-15",
    type: "Lab Report",
    title: "Complete Blood Count (CBC)",
    doctor: "Dr. Sarah Williams",
    summary: "All blood parameters within normal range. Hemoglobin: 14.2 g/dL, WBC: 7,200/μL, Platelets: 250,000/μL",
    attachments: ["cbc_report.pdf"]
  },
  {
    id: "MR002",
    date: "2025-12-10",
    type: "Diagnostic Test",
    title: "Pulmonary Function Test",
    doctor: "Dr. James Anderson",
    summary: "Mild obstructive pattern consistent with asthma. FEV1: 82% predicted, improved to 95% post-bronchodilator",
    attachments: ["pft_results.pdf"]
  },
  {
    id: "MR003",
    date: "2025-11-28",
    type: "Lab Report",
    title: "Vitamin D Levels",
    doctor: "Dr. Sarah Williams",
    summary: "Vitamin D: 18 ng/mL (Deficient). Recommended supplementation initiated.",
    attachments: ["vitamin_d_report.pdf"]
  },
  {
    id: "MR004",
    date: "2025-11-20",
    type: "Imaging",
    title: "Chest X-Ray",
    doctor: "Dr. James Anderson",
    summary: "Clear lung fields, no acute infiltrates or effusions. Normal cardiac silhouette.",
    attachments: ["xray_chest.jpg"]
  }
];
