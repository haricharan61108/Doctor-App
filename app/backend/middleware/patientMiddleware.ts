import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import prisma from "../src/lib/prisma";

export const patientMiddleware = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.jwt_patient;

        if(!token) {
            res.status(401).json({message:"Unauthorized: No token provided"});
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_PATIENT_SECRET!) as { patientId: string };
        if(!decoded || !decoded.patientId) {
            res.status(401).json({ message: "Unauthorized - Invalid Token" });
            return;
        }

        const patient = await prisma.patient.findUnique({
            where: {
                id: decoded.patientId
            },
            select: {
                id: true,
                email: true,
                name: true,
            }
        });

        if(!patient) {
            res.status(404).json({ message: "Patient not found" });
            return;
        }

        (req as any).patient = patient;
        next();
    } catch (error: any) {
        console.error("Error in patient auth middleware:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}