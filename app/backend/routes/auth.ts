import express from "express";
import { login as doctorLogin, logout as doctorLogout, signup as doctorSignup } from "../controllers/doctorControllers";
import { login as patientLogin, logout as patientLogout, googleAuth as patientGoogleAuth } from "../controllers/patientControllers";
import { login as pharmacistLogin, logout as pharmacistLogout, signup as pharmacistSignup } from "../controllers/pharmacistController";
import { doctorMiddleware } from "../middleware/doctorMiddleware";
import { patientMiddleware } from "../middleware/patientMiddleware";
import { pharmacistMiddleware } from "../middleware/pharmacistMiddleware";

export const authRouter = express.Router();

// Doctor authentication routes
authRouter.post("/doctor/signup", doctorSignup);
authRouter.post("/doctor/login", doctorLogin);
authRouter.post("/doctor/logout", doctorMiddleware, doctorLogout);

// Patient authentication routes
authRouter.post("/patient/google-auth", patientGoogleAuth); 
authRouter.post("/patient/login", patientLogin);
authRouter.post("/patient/logout", patientMiddleware, patientLogout);

// Pharmacist authentication routes
authRouter.post("/pharmacist/signup", pharmacistSignup);
authRouter.post("/pharmacist/login", pharmacistLogin);
authRouter.post("/pharmacist/logout", pharmacistMiddleware, pharmacistLogout);