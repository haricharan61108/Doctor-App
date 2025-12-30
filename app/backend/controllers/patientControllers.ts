import prisma from "../src/lib/prisma";
import type { Request, Response } from "express";
import { generatePatientToken } from "../utils/generateToken";
import { generateDefaultTimeSlots } from "../utils/defaultTimeSlots";
import { OAuth2Client } from 'google-auth-library';
import { uploadFileToSupabase,deleteFileFromSupabase, supabase } from "../utils/supabaseStorage";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth login/signup - expects Google user data
export const googleAuth = async(req: Request, res: Response): Promise<void> => {
    const { idToken } = req.body;
    if(!idToken) {
        res.status(400).json({ error: "ID token required" });
        return ;
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if(!payload || !payload.email) {
            res.status(400).json({ error: "Invalid ID token" });
            return ;
        } 

        const email = payload.email;
        const name = payload.name || null;
        const googleId = payload.sub;
        const avatarUrl = payload.picture || null;

        if(!payload.email_verified) {
            res.status(400).json({ error: "Email not verified" });        
            return ;
        }
        let patient = await prisma.patient.findUnique({
            where: {
                email
            }
        })
        if (!patient) {
            patient = await prisma.patient.create({
                data: {
                    email,
                    name: name || null,
                    googleId: googleId || null,
                    avatarUrl: avatarUrl || null
                }
            });
        } else {
            if (!patient.googleId && googleId) {
                patient = await prisma.patient.update({
                    where: { email },
                    data: {
                        googleId,
                        name: name || patient.name,
                        avatarUrl: avatarUrl || patient.avatarUrl
                    }
                });
            }
        }

        generatePatientToken(patient.id, res);

        res.status(200).json({
            message: "Login successful",
            patient: {
                id: patient.id,
                email: patient.email,
                name: patient.name,
                avatarUrl: patient.avatarUrl,
                phone: patient.phone
            }
        });
    } catch (error: any) {
        console.error("Error in Google auth:", error.message);
        res.status(500).json({ error: "Authentication failed" });
    }
}

// Regular email login (for future use)
export const login = async(req: Request, res: Response): Promise<void> => {
    const { email, googleId } = req.body;

    if (!email) {
        res.status(400).json({ error: "Email required" });
        return;
    }

    // Find or create patient via Google OAuth
    const patient = await prisma.patient.findUnique({
        where: {
            email
        }
    });

    if (!patient) {
        res.status(401).json({ error: "Patient not found" });
        return;
    }

    generatePatientToken(patient.id, res);

    res.status(200).json({
        message: "Login successful",
        patient: {
            id: patient.id,
            email: patient.email,
            name: patient.name,
            avatarUrl: patient.avatarUrl,
            phone: patient.phone
        }
    });
}

export const logout = async (req: Request, res: Response): Promise<void> => {
    res.cookie("jwt_patient", "", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
    });
    res.status(200).json({ message: "Logout successful" });
}

// Get patient's own appointments
export const getMyAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const patientId = (req as any).patient.id;

        const appointments = await prisma.appointment.findMany({
            where: {
                patientId
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        specialization: true,
                        avatarUrl: true,
                    }
                }
            },
            orderBy: {
                scheduledAt: 'desc'
            }
        });

        res.status(200).json({ appointments });
    } catch (error: any) {
        console.error("Error fetching appointments:", error.message);
        res.status(500).json({ error: "Failed to fetch appointments" });
    }
}

// Get patient's own prescriptions
export const getMyPrescriptions = async (req: Request, res: Response): Promise<void> => {
    try {
        const patientId = (req as any).patient.id;

        const prescriptions = await prisma.prescription.findMany({
            where: {
                patientId
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true,
                    }
                },
                appointment: {
                    select: {
                        scheduledAt: true,
                        status: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({ prescriptions });
    } catch (error: any) {
        console.error("Error fetching prescriptions:", error.message);
        res.status(500).json({ error: "Failed to fetch prescriptions" });
    }
}

export const getAllDoctors = async(req: Request, res: Response): Promise<void> => {
    try {
        const doctors = await prisma.doctor.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                specialization: true,
                avatarUrl: true,
                _count: {
                    select: {
                        appointments: true,
                    }
                }
            },
            orderBy : {
                name: 'asc'
            }
        });
        res.status(200).json({ doctors });
    } catch (error:any) {
        console.error("Error fetching doctors:", error.message);
        res.status(500).json({ error: "Failed to fetch doctors" });
    }
}

export const getDoctorTimings = async(req: Request, res: Response): Promise<void> => {
    try {
        const {doctorId} = req.params;
        const {date} = req.query;

        if(!doctorId) {
            res.status(400).json({ error: "Doctor ID required" });
            return;
        }

        // Verify doctor exists
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId }
        });

        if (!doctor) {
            res.status(404).json({ error: "Doctor not found" });
            return;
        }

        // Parse the date (default to today if not provided)
        let targetDate: Date;
        if (date && typeof date === 'string') {
            const parts = date.split('-');
            const year = parseInt(parts[0] || '0', 10);
            const month = parseInt(parts[1] || '0', 10);
            const day = parseInt(parts[2] || '0', 10);
            targetDate = new Date(year, month - 1, day);
        } else {
            targetDate = new Date();
        }
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Check if doctor has custom timings for this date
        const customTimings = await prisma.doctorTiming.findMany({
            where: {
                doctorId,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });


        if (customTimings.length > 0) {
            const availableTimings = customTimings.filter(timing => !timing.isBooked);
            res.status(200).json({ timings: availableTimings });
            return;
        }

        // Generate default time slots if no custom timings
        const defaultSlots = generateDefaultTimeSlots(targetDate);


        const existingAppointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                scheduledAt: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    in: ['BOOKED', 'COMPLETED']
                }
            }
        });

        // Mark slots as booked if they conflict with existing appointments
        const timingsWithBookingStatus = defaultSlots.map(slot => {
            const isBooked = existingAppointments.some(appointment => {
                const appointmentStart = new Date(appointment.scheduledAt);
                const appointmentEnd = new Date(appointmentStart);
                appointmentEnd.setMinutes(appointmentEnd.getMinutes() + appointment.duration);

                // Check if slot overlaps with appointment
                return (
                    slot.startTime < appointmentEnd &&
                    slot.endTime > appointmentStart
                );
            });

            return {
                id: `default-${slot.startTime.getTime()}`, 
                doctorId,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isBooked,
                createdAt: new Date()
            };
        });

        const now = new Date();
        const availableTimings = timingsWithBookingStatus.filter(timing => {
            if (timing.isBooked) return false;

            // If the date is today, filter out past slots
            if (targetDate.toDateString() === now.toDateString()) {
                return timing.startTime > now;
            }

            return true;
        });

        res.status(200).json({ timings: availableTimings });
    } catch (error: any) {
        console.error("Error fetching doctor timings:", error.message);
        res.status(500).json({ error: "Failed to fetch doctor timings" });
    }
}

export const bookAppointment = async(req: Request, res: Response): Promise<void> => {
    try {
        const patientId = (req as any).patient.id;

        const {doctorId, scheduledAt, duration=30, timingId} = req.body;

        if(!doctorId || !scheduledAt) {
            res.status(400).json({ error: "Doctor ID and scheduledAt required" });
            return;
        }

        const doctor = await prisma.doctor.findUnique({
            where: {
                id: doctorId
            },
        });

        if(!doctor) {
            res.status(404).json({ error: "Doctor not found" });
            return;
        }

        const appointmentStart = new Date(scheduledAt);
        const appointmentDuration = duration || 30;
        const appointmentEnd = new Date(appointmentStart);
        appointmentEnd.setMinutes(appointmentEnd.getMinutes() + appointmentDuration);


        const isCustomTiming = timingId && !timingId.startsWith('default-');

        if(isCustomTiming) {
            const timing = await prisma.doctorTiming.findUnique({
                where: {
                    id: timingId
                }
            });

            if (!timing) {
                res.status(404).json({ error: "Time slot not found" });
                return;
            }

            if (timing.isBooked) {
                res.status(409).json({ error: "This time slot is already booked" });
                return;
            }

            // Mark timing as booked
            await prisma.doctorTiming.update({
                where: { id: timingId },
                data: { isBooked: true }
            });
        } else {

            const conflictingAppointment = await prisma.appointment.findFirst({
                where: {
                    doctorId,
                    scheduledAt: {
                        gte: new Date(appointmentStart.getTime() - appointmentDuration * 60 * 1000),
                        lte: appointmentEnd
                    },
                    status: {
                        in: ['BOOKED', 'COMPLETED']
                    }
                }
            });

            if (conflictingAppointment) {
                const conflictStart = new Date(conflictingAppointment.scheduledAt);
                const conflictEnd = new Date(conflictStart);
                conflictEnd.setMinutes(conflictEnd.getMinutes() + conflictingAppointment.duration);

                // Check if there's actual overlap
                if (appointmentStart < conflictEnd && appointmentEnd > conflictStart) {
                    res.status(409).json({ error: "This time slot is already booked" });
                    return;
                }
            }
        }

        // Create appointment
        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                scheduledAt: appointmentStart,
                duration: appointmentDuration,
                status: "BOOKED"
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        specialization: true,
                        avatarUrl: true,
                    }
                }
            }
        });

        res.status(201).json({
            message: "Appointment booked successfully",
            appointment
        });
    } catch (error: any) {
        console.error("Error booking appointment:", error.message);
        res.status(500).json({ error: "Failed to book appointment" });
    }
}

export const uploadPrescriptionPDF = async(req: Request, res: Response): Promise<void>=> {
    try {
        const patientId = (req as any).patient.id;

        if(!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }

        const file = req.file;
        const {path, url} = await uploadFileToSupabase(file, patientId);

        const patientFile = await prisma.patientFile.create({
            data: {
                patientId,
                  fileName: file.originalname,
                  fileUrl: path,
                  fileType: file.mimetype,
                  fileSize: file.size
            }
        });

        res.status(201).json({
            message: "Prescription uploaded successfully",
            file: {
                ...patientFile,
                downloadUrl: url 
            }
        });
    } catch (error: any) {
        console.error("❌ Error uploading prescription:", error.message);
        console.error("Full error:", error);
          res.status(500).json({ error: "Failed to upload prescription"});
    }
};

export const getMyUploadedFiles = async(req: Request, res: Response): Promise<void> => {
    try {
        const patientId = (req as any).patient.id;

          const files = await prisma.patientFile.findMany({
              where: {
                  patientId
              },
              orderBy: {
                  uploadedAt: 'desc'
              }
          });
          
          const filesWithUrls = files.map(file => {
            const { data: urlData } = supabase.storage
                .from('prescriptions')
                .getPublicUrl(file.fileUrl);

            return {
                ...file,
                downloadUrl: urlData.publicUrl
            };
        });

        res.status(200).json({ files: filesWithUrls });
    } catch (error: any) {
        console.error("Error fetching uploaded files:", error.message);
          res.status(500).json({ error: "Failed to fetch uploaded files"});
    }
}

export const deleteUploadedFile = async(req: Request, res: Response): Promise<void> => {
    try {
        const patientId = (req as any).patient.id;
          const { fileId } = req.params;

          const file = await prisma.patientFile.findUnique({
              where: { id: fileId }
          });

          if (!file) {
            res.status(404).json({ error: "File not found" });
            return;
        }

        if (file.patientId !== patientId) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }
        
        await deleteFileFromSupabase(file.fileUrl);

        await prisma.patientFile.delete({
            where: { id: fileId }
        });

        res.status(200).json({ message: "File deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting file:", error.message);
        res.status(500).json({ error: "Failed to delete file" });
    }
}


//getting patient prescription for a particular booked appointment
export const getPatientPrescriptionByAppointment = async(req: Request, res: Response): Promise<void> => {
    try {
        const patientId = (req as any).patient.id;
        const { appointmentId } = req.params;
        
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        });

        if (!appointment) {
            res.status(404).json({ error: "Appointment not found" });
            return;
        }

        if (appointment.patientId !== patientId) {
            res.status(403).json({ error: "Unauthorized: This appointment does not belong to you" });
            return;
        }

        const prescription = await prisma.prescription.findFirst({
            where: {
                appointmentId: appointmentId,
                patientId: patientId
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true,
                    }
                }
            }
        });
        if (!prescription) {
            res.status(404).json({ error: "Prescription not found for this appointment" });
            return;
        }

        res.status(200).json({ prescription });
    } catch (error: any) {
        console.error("Error fetching prescription:", error.message);
        res.status(500).json({ error: "Failed to fetch prescription" });
    }
}