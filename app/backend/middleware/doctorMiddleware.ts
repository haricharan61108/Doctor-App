import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import prisma from "../src/lib/prisma";

export const doctorMiddleware = async(req: Request,res:Response,next:NextFunction)=> {
    try {
        const token = req.cookies.jwt;

        if(!token) {
            res.status(401).json({message:"Unauthorized:No token Provided"});
            return;
        }

        const decoded=jwt.verify(token,process.env.JWT_DOCTOR_SECRET!) as { doctorId: string };
        if(!decoded || !decoded.doctorId) {
            res.status(401).json({ message: "Unauthorized - Invalid Token" });

            return ;
        }

        const doctor = await prisma.doctor.findUnique({
            where: {
                id: decoded.doctorId
            },
            select: {
                id:true,
                email:true,
            }
        });

        if(!doctor) {
            res.status(404).json({ message: "Doctor not found" });
            return ;
        }

        (req as any).doctor = doctor;
        next();
    } catch (error: any) {
        console.error("Error in doctor auth middleware:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}