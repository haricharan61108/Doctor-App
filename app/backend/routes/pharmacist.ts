import express from "express";
  import {
      getReadyPrescriptions,
      markAsPurchased,
      getPurchasedPrescriptions
  } from "../controllers/pharmacistController";
  import { pharmacistMiddleware } from
  "../middleware/pharmacistMiddleware";

  export const pharmacistRouter = express.Router();

  pharmacistRouter.use(pharmacistMiddleware);

  pharmacistRouter.get("/prescriptions/ready", getReadyPrescriptions);

  pharmacistRouter.post("/prescriptions/:prescriptionId/purchase",markAsPurchased);

  pharmacistRouter.get("/prescriptions/history",getPurchasedPrescriptions);