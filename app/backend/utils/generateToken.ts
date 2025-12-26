import jwt from "jsonwebtoken";
import type { Response } from "express";


export const generateToken=(doctorId: string, res: Response)=> {
    const token=jwt.sign({doctorId},process.env.JWT_DOCTOR_SECRET!,{
        expiresIn:"7d",
    });
    res.cookie("jwt",token,{
        httpOnly:true,
        sameSite:"strict",
        secure: process.env.NODE_ENV === "production",
        maxAge:7 * 24 * 60 * 60 * 1000,
    })

    return token;
}

export const generatePatientToken=(patientId: string, res: Response)=> {
    const token=jwt.sign({patientId},process.env.JWT_PATIENT_SECRET!,{
        expiresIn:"7d",
    });
    res.cookie("jwt_patient",token,{
        httpOnly:true,
        sameSite:"strict",
        secure: process.env.NODE_ENV === "production",
        maxAge:7 * 24 * 60 * 60 * 1000,
    })

    return token;
}

export const generatePharmacistToken=(pharmacistId: string, res: Response)=> {
    const token=jwt.sign({pharmacistId},process.env.JWT_PHARMACIST_SECRET!,{
        expiresIn:"7d",
    });
    res.cookie("jwt_pharmacist",token,{
        httpOnly:true,
        sameSite:"strict",
        secure: process.env.NODE_ENV === "production",
        maxAge:7 * 24 * 60 * 60 * 1000,
    })

    return token;
}