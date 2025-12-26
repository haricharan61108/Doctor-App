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

export interface Prescription {
  id: string;
  content: string;
  status: string;
  issuedAt: string;
  expiresAt: string;
  dispensedAt?: string;
  patient: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  doctor: {
    id: string;
    name: string;
    specialization?: string;
  };
  createdAt: string;
}

export interface PrescriptionsResponse {
  prescriptions: Prescription[];
}

export interface PurchaseResponse {
  message: string;
  prescription: Prescription;
}

const pharmacistApi = {
  // Get all READY_FOR_PICKUP prescriptions
  getReadyPrescriptions: async (): Promise<Prescription[]> => {
    const response = await api.get<PrescriptionsResponse>('/pharmacist/prescriptions/ready');
    return response.data.prescriptions;
  },

  // Mark prescription as PURCHASED
  markAsPurchased: async (prescriptionId: string): Promise<Prescription> => {
    const response = await api.post<PurchaseResponse>(
      `/pharmacist/prescriptions/${prescriptionId}/purchase`
    );
    return response.data.prescription;
  },

  // Get prescription history (already dispensed)
  getPurchasedPrescriptions: async (): Promise<Prescription[]> => {
    const response = await api.get<PrescriptionsResponse>('/pharmacist/prescriptions/history');
    return response.data.prescriptions;
  },
};

export default pharmacistApi;
