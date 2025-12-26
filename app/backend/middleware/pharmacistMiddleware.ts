import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import prisma from "../src/lib/prisma";

export const pharmacistMiddleware = async(req: Request,res:Response,next:NextFunction)=> {
    try {
        const token = req.cookies.jwt_pharmacist;

        if(!token) {
            res.status(401).json({message:"Unauthorized: No token provided"});
            return;
        }

        const decoded=jwt.verify(token,process.env.JWT_PHARMACIST_SECRET!) as { pharmacistId: string };
        if(!decoded || !decoded.pharmacistId) {
            res.status(401).json({ message: "Unauthorized - Invalid token" });

            return ;
        }

        const pharmacist = await prisma.pharmacy.findUnique({
            where: {
                id: decoded.pharmacistId
            },
            select: {
                id:true,
                email:true,
                name:true
            }
        });

        if(!pharmacist) {
            res.status(404).json({ message: "Pharmacist not found" });
            return ;
        }

        (req as any).pharmacist = pharmacist;
        next();
    } catch (error: any) {
        console.error("Error in pharmacist auth middleware:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}