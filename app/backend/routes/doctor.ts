import express from "express";
import {
    getAllPatients,
    getPatientWithPrescriptions,
    createPrescription,
    finalizePrescription,
    deletePrescription,
    getAppointmentDetails
} from "../controllers/doctorControllers";
import { doctorMiddleware } from "../middleware/doctorMiddleware";

export const doctorRouter = express.Router();

// All routes require authentication
doctorRouter.use(doctorMiddleware);

// Get all patients with booked appointments
doctorRouter.get("/patients", getAllPatients);

// Get specific patient with prescription history
doctorRouter.get("/patients/:patientId", getPatientWithPrescriptions);

// Create new prescription
doctorRouter.post("/prescriptions", createPrescription);

// Finalize prescription (push to pharmacy)
doctorRouter.patch("/prescriptions/:prescriptionId/finalize", finalizePrescription);

// Delete pending prescription
doctorRouter.delete("/prescriptions/:prescriptionId", deletePrescription);

doctorRouter.get("/appointments/:appointmentId", getAppointmentDetails);
