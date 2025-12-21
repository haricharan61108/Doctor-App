import "dotenv/config";
import prisma from "./src/lib/prisma";
import { authRouter } from "./routes/auth";
import { doctorRouter } from "./routes/doctor";
import { patientRouter } from "./routes/patient";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || ["http://localhost:5173","http://localhost:3000"],
    credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use("/api/auth", authRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/patient", patientRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});





