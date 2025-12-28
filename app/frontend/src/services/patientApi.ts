import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for JWT cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  avatarUrl: string | null;
  _count?: {
    appointments: number;
  };
}

export interface DoctorTiming {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface AppointmentResponse {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  duration: number;
  status: string;
  doctor: {
    id: string;
    name: string;
    email: string;
    specialization: string;
    avatarUrl: string | null;
  };
}

export interface BookingPayload {
  doctorId: string;
  scheduledAt: string;
  duration?: number;
  timingId?: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
}

export interface PatientFile {
  id: string;
  patientId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  downloadUrl?: string; // Public URL for downloading/viewing the file
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  content: string;
  status: string;
  createdAt: string;
  issuedAt: string | null;
  expiresAt: string | null;
  doctor: {
    id: string;
    name: string;
    specialization: string;
  };
}

// API Functions
export const patientApi = {
  // Get all available doctors
  getAllDoctors: async () => {
    const response = await api.get<{ doctors: Doctor[] }>('/patient/doctors');
    return response.data.doctors;
  },

  // Get doctor's available time slots
  getDoctorTimings: async (doctorId: string, date?: string) => {
    const params = date ? { date } : {};
    const response = await api.get<{ timings: DoctorTiming[] }>(
      `/patient/doctors/${doctorId}/timings`,
      { params }
    );
    return response.data.timings;
  },

  // Book an appointment
  bookAppointment: async (payload: BookingPayload) => {
    const response = await api.post<{ message: string; appointment: AppointmentResponse }>(
      '/patient/appointments',
      payload
    );
    return response.data;
  },

  // Get patient's appointments
  getMyAppointments: async () => {
    const response = await api.get('/patient/appointments');
    return response.data.appointments;
  },

  // Get patient's prescriptions
  getMyPrescriptions: async () => {
    const response = await api.get('/patient/prescriptions');
    return response.data.prescriptions;
  },

  //Upload prescription PDF
  uploadPrescriptionFile: async(file: File) => {
    const formData = new FormData();

    formData.append('prescription', file);

    const response = await api.post<{ message: string; file: PatientFile
    }>(
        '/patient/files/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
  },

  // Get uploaded files
  getUploadedFiles: async () => {
    const response = await api.get<{ files: PatientFile[]
  }>('/patient/files');
    return response.data.files;
  },

   // Delete uploaded file
   deleteUploadedFile: async (fileId: string) => {
    const response = await api.delete<{ message: string
  }>(`/patient/files/${fileId}`);
    return response.data;
  },

  // Get prescription by appointment ID
  getPrescriptionByAppointment: async (appointmentId: string) => {
    const response = await api.get<{ prescription: Prescription }>(
      `/patient/prescriptions/${appointmentId}`
    );
    return response.data.prescription;
  },

};

export default patientApi;
