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
 

  export const doctorApi = {
    //get all booked appointments
    getAllAppointments: async() => {
        const res = await api.get<{appointments: Appointment[]}>('/doctor/patients');
        return res.data.appointments;
    }
  }
  

  export default doctorApi;