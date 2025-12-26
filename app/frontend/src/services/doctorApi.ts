import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

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
  
  export interface Patient {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  }

  export interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    scheduledAt: string;
    duration: number;
    status: string;
    patient: Patient;
  }

  export interface PatientFile {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
    downloadUrl?: string; // URL for downloading/viewing the file
  }

  export interface PrescriptionDetail {
    id: string;
    content: string;
    pdfUrl?: string;
    status: string;
    createdAt: string;
    issuedAt?: string;
    expiresAt?: string;
    appointment?: {
      scheduledAt: string;
      status: string;
    };
  }

  export interface PatientDetail extends Patient {
    prescriptions: PrescriptionDetail[];
    uploadedFiles: PatientFile[];
  }

  export interface AppointmentDetail {
    id: string;
    scheduledAt: string;
    duration: number;
    status: string;
    patient: PatientDetail;
  }


  export const doctorApi = {
    //get all booked appointments
    getAllAppointments: async() => {
        const res = await api.get<{appointments: Appointment[]}>('/doctor/patients');
        return res.data.appointments;
    },

    // Get appointment details with patient and prescriptions
    getAppointmentDetails: async(appointmentId: string) => {
        const res = await api.get<{appointment: AppointmentDetail}>(`/doctor/appointments/${appointmentId}`);
        return res.data.appointment;
    },

    // Create new prescription
    createPrescription: async(data: {
        patientId: string;
        appointmentId: string;
        content: string;
    }) => {
        const res = await api.post('/doctor/prescriptions', data);
        return res.data.prescription;
    }
  }


  export default doctorApi;