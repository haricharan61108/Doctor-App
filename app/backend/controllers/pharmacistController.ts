import prisma from "../src/lib/prisma";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { generatePharmacistToken } from "../utils/generateToken";

export const login = async(req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: "Email and password required" });
        return
     }
    const pharmacist = await prisma.pharmacy.findUnique({
        where: {
            email
        }
    });
    if (!pharmacist) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
    const isPasswordCorrect = await bcrypt.compare(password, pharmacist.password);
    if (!isPasswordCorrect) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
    }
    generatePharmacistToken(pharmacist.id, res);

    const { password: _, ...pharmacistWithoutPassword } = pharmacist;
    res.status(200).json({ message: "Login successful", pharmacist: pharmacistWithoutPassword });
}

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({ error: "Email, password, and name are required" });
            return;
        }

        // Check if pharmacist already exists
        const existingPharmacist = await prisma.pharmacy.findUnique({
            where: { email }
        });

        if (existingPharmacist) {
            res.status(409).json({ error: "Pharmacist with this email already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const pharmacist = await prisma.pharmacy.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });

        generatePharmacistToken(pharmacist.id, res);

        const { password: _, ...pharmacistWithoutPassword } = pharmacist;
        res.status(201).json({
            message: "Pharmacist account created successfully",
            pharmacist: pharmacistWithoutPassword
        });
    } catch (error: any) {
        console.error("Error creating pharmacist account:", error.message);
        res.status(500).json({ error: "Failed to create pharmacist account" });
    }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
    res.cookie("jwt_pharmacist", "", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
    });
    res.status(200).json({ message: "Logout successful" });
}

export const getReadyPrescriptions = async(req: Request, res: Response): Promise<void> => {
    try {
        const now = new Date();
        await prisma.prescription.updateMany({
            where: {
                status: "READY_FOR_PICKUP",
                expiresAt: {
                    lte: now
                }
            },
            data: {
                status: "EXPIRED"
            }
        });

        const prescriptions = await prisma.prescription.findMany({
            where: {
                status: "READY_FOR_PICKUP",
                expiresAt: {
                    gt: now 
                }
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true
                    }
                }
            },
            orderBy: {
                issuedAt: 'desc' 
            }
        });

        res.status(200).json({ prescriptions });
    } catch (error: any) {
        console.error("Error fetching ready prescriptions:",error.message);
        res.status(500).json({ error: "Failed to fetch prescriptions"});
    }
}

export const markAsPurchased = async (req: Request, res: Response): Promise<void> => {
    try {
        const { prescriptionId } = req.params;
        if(!prescriptionId) {
            res.status(400).json({ error: "Prescription ID is required" });
            return;
        }

        const prescription = await prisma.prescription.findUnique({
            where: { id: prescriptionId }
        });

        if(!prescription) {
            res.status(404).json({ error: "Prescription not found" });
            return;
        }

        if (prescription.status !== "READY_FOR_PICKUP") {
            res.status(400).json({ error: "Only READY_FOR_PICKUP prescriptions can be marked as purchased" });
            return;
        }

        const now = new Date();
          if (prescription.expiresAt && prescription.expiresAt <= now) {
              await prisma.prescription.update({
                  where: { id: prescriptionId },
                  data: { status: "EXPIRED" }
              });
              res.status(400).json({ error: "Prescription has expired" });
              return;
          }

          const updatedPrescription = await prisma.prescription.update({
            where: { id: prescriptionId },
            data: {
                status: "PURCHASED",
                dispensedAt: now,
                pharmacyId: (req as any).pharmacist.id 
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true
                    }
                }
            }
        });

        res.status(200).json({
            message: "Prescription marked as purchased",
            prescription: updatedPrescription
        });
    } catch (error: any) {
        console.error("Error marking prescription as purchased:",error.message);
        res.status(500).json({ error: "Failed to mark prescription as purchased" });
    }
}

export const getPurchasedPrescriptions = async (req: Request, res:
    Response): Promise<void> => {
        try {
            const pharmacistId = (req as any).pharmacist.id;
  
            const prescriptions = await prisma.prescription.findMany({
                where: {
                    pharmacyId: pharmacistId,
                    status: "PURCHASED"
                },
                include: {
                    patient: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    doctor: {
                        select: {
                            id: true,
                            name: true,
                            specialization: true
                        }
                    }
                },
                orderBy: {
                    dispensedAt: 'desc'
                }
            });
  
            res.status(200).json({ prescriptions });
        } catch (error: any) {
            console.error("Error fetching purchased prescriptions:",
    error.message);
            res.status(500).json({ error: "Failed to fetch purchased prescriptions" });
        }
    }
