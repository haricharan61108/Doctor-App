import express from "express";
import {
    getMyAppointments,
    getMyPrescriptions,
    getAllDoctors,
    getDoctorTimings,
    bookAppointment,
    uploadPrescriptionPDF,
    getMyUploadedFiles,
    deleteUploadedFile
} from "../controllers/patientControllers";
import { patientMiddleware } from "../middleware/patientMiddleware";
import { uploadPrescription } from "../utils/multerConfig";
import type { Request, Response,NextFunction } from "express";

export const patientRouter = express.Router();

// Protected routes (authentication required)
patientRouter.use(patientMiddleware);

// Get all available doctors - public so patients can see doctors before booking
patientRouter.get("/doctors", getAllDoctors);

// Get available time slots for a specific doctor - public for booking flow
patientRouter.get("/doctors/:doctorId/timings", getDoctorTimings);

// Book an appointment
patientRouter.post("/appointments", bookAppointment);

// Get patient's own appointments
patientRouter.get("/appointments", getMyAppointments);

// Get patient's own prescriptions
patientRouter.get("/prescriptions", getMyPrescriptions);

//File uploads
patientRouter.post("/files/upload", (req: Request, res: Response, next: NextFunction) => {
    console.log('🎯 Upload route hit! Method:', req.method, 'URL:', req.url);
    console.log('📦 Content-Type:', req.headers['content-type']);
    next();
}, uploadPrescription.single('prescription'), (err: any, req: any, res: any, next: any) => {
    console.log('⚠️  Multer error handler triggered');
    if (err) {
        console.error('❌ Multer error:', err.message);
        return res.status(400).json({ error: err.message });
    }
    next();
}, uploadPrescriptionPDF);

patientRouter.get("/files", getMyUploadedFiles);

patientRouter.delete("/files/:fileId", deleteUploadedFile);
