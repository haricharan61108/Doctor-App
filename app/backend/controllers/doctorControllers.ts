import prisma from "../src/lib/prisma";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";

export const login = async(req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: "Email and password required" });
        return
     }
    const doctor = await prisma.doctor.findUnique({
        where: {
            email
        }
    });
    if (!doctor) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
    const isPasswordCorrect = await bcrypt.compare(password, doctor.password);
    if (!isPasswordCorrect) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
    }
    generateToken(doctor.id, res);

    const { password: _, ...doctorWithoutPassword } = doctor;
    res.status(200).json({ message: "Login successful", doctor: doctorWithoutPassword });
}

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name, specialization } = req.body;

        // Validate required fields
        if (!email || !password || !name) {
            res.status(400).json({ error: "Email, password, and name are required" });
            return;
        }

        // Check if doctor already exists
        const existingDoctor = await prisma.doctor.findUnique({
            where: { email }
        });

        if (existingDoctor) {
            res.status(409).json({ error: "Doctor with this email already exists" });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create doctor
        const doctor = await prisma.doctor.create({
            data: {
                email,
                password: hashedPassword,
                name,
                specialization: specialization || null
            }
        });

        // Generate token and set cookie
        generateToken(doctor.id, res);

        // Remove password from response
        const { password: _, ...doctorWithoutPassword } = doctor;
        res.status(201).json({
            message: "Doctor account created successfully",
            doctor: doctorWithoutPassword
        });
    } catch (error: any) {
        console.error("Error creating doctor account:", error.message);
        res.status(500).json({ error: "Failed to create doctor account" });
    }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
    res.cookie("jwt", "", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
    });
    res.status(200).json({ message: "Logout successful" });
}

// Get all patients with appointments for this doctor
export const getAllPatients = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctorId = (req as any).doctor.id;

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                status: "BOOKED"
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatarUrl: true,
                        phone: true,
                    }
                }
            },
            orderBy: {
                scheduledAt: 'asc'
            }
        });

        res.status(200).json({ appointments });
    } catch (error: any) {
        console.error("Error fetching patients:", error.message);
        res.status(500).json({ error: "Failed to fetch patients" });
    }
}

// Get patient details with prescription history
export const getPatientWithPrescriptions = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctorId = (req as any).doctor.id;
        const { patientId } = req.params;

        if (!patientId) {
            res.status(400).json({ error: "Patient ID is required" });
            return;
        }

        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                phone: true,
                prescriptions: {
                    where: {
                        doctorId
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        appointment: {
                            select: {
                                scheduledAt: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });

        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        res.status(200).json({ patient });
    } catch (error: any) {
        console.error("Error fetching patient details:", error.message);
        res.status(500).json({ error: "Failed to fetch patient details" });
    }
}

// Create new prescription
export const createPrescription = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctorId = (req as any).doctor.id;
        const { patientId, appointmentId, content } = req.body;

        if (!patientId || !content) {
            res.status(400).json({ error: "Patient ID and content are required" });
            return;
        }

        // Verify patient exists
        const patient = await prisma.patient.findUnique({
            where: { id: patientId }
        });

        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        // Create prescription
        const prescription = await prisma.prescription.create({
            data: {
                patientId,
                doctorId,
                appointmentId: appointmentId || null,
                content,
                status: "PENDING"
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.status(201).json({ message: "Prescription created", prescription });
    } catch (error: any) {
        console.error("Error creating prescription:", error.message);
        res.status(500).json({ error: "Failed to create prescription" });
    }
}

// Finalize prescription (push to pharmacy)
export const finalizePrescription = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctorId = (req as any).doctor.id;
        const { prescriptionId } = req.params;

        if (!prescriptionId) {
            res.status(400).json({ error: "Prescription ID is required" });
            return;
        }

        // Verify prescription belongs to doctor
        const prescription = await prisma.prescription.findUnique({
            where: { id: prescriptionId }
        });

        if (!prescription) {
            res.status(404).json({ error: "Prescription not found" });
            return;
        }

        if (prescription.doctorId !== doctorId) {
            res.status(403).json({ error: "Unauthorized to finalize this prescription" });
            return;
        }

        if (prescription.status !== "PENDING") {
            res.status(400).json({ error: "Only pending prescriptions can be finalized" });
            return;
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days

        // Update prescription status
        const updatedPrescription = await prisma.prescription.update({
            where: { id: prescriptionId },
            data: {
                status: "READY_FOR_PICKUP",
                issuedAt: now,
                expiresAt
            }
        });

        res.status(200).json({ message: "Prescription finalized", prescription: updatedPrescription });
    } catch (error: any) {
        console.error("Error finalizing prescription:", error.message);
        res.status(500).json({ error: "Failed to finalize prescription" });
    }
}

// Delete pending prescription
export const deletePrescription = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctorId = (req as any).doctor.id;
        const { prescriptionId } = req.params;

        if (!prescriptionId) {
            res.status(400).json({ error: "Prescription ID is required" });
            return;
        }

        // Verify prescription belongs to doctor
        const prescription = await prisma.prescription.findUnique({
            where: { id: prescriptionId }
        });

        if (!prescription) {
            res.status(404).json({ error: "Prescription not found" });
            return;
        }

        if (prescription.doctorId !== doctorId) {
            res.status(403).json({ error: "Unauthorized to delete this prescription" });
            return;
        }

        if (prescription.status !== "PENDING") {
            res.status(400).json({ error: "Only pending prescriptions can be deleted" });
            return;
        }

        await prisma.prescription.delete({
            where: { id: prescriptionId }
        });

        res.status(200).json({ message: "Prescription deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting prescription:", error.message);
        res.status(500).json({ error: "Failed to delete prescription" });
    }
}