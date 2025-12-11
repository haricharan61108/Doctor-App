import prisma from "../src/lib/prisma";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { Elysia } from "elysia";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authRouter = new Elysia()
  .post("/google", async ({ body }) => {
    const { token, userInfo } = body as { token: string; userInfo?: any };

    try {
      let email: string, name: string, picture: string, sub: string;

      // If userInfo is provided (from access token flow)
      if (userInfo) {
        email = userInfo.email;
        name = userInfo.name;
        picture = userInfo.picture;
        sub = userInfo.sub;
      } else {
        // Fallback to ID token verification
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) throw new Error("Invalid Google token");

        email = payload.email!;
        name = payload.name!;
        picture = payload.picture!;
        sub = payload.sub;
      }

      // Find or create patient
      let patient = await prisma.patient.findUnique({ where: { email } });

      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            googleId: sub,
            email,
            name,
            avatarUrl: picture,
            authProvider: "GOOGLE",
          },
        });
      } else if (!patient.googleId) {
        // Update existing patient with Google ID if they don't have one
        patient = await prisma.patient.update({
          where: { email },
          data: { googleId: sub, avatarUrl: picture },
        });
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        { id: patient.id, email: patient.email, role: "patient" },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return {
        success: true,
        token: jwtToken,
        user: {
          id: patient.id,
          email: patient.email,
          name: patient.name,
          avatarUrl: patient.avatarUrl,
        },
      };
    } catch (error) {
      console.error("Google auth error:", error);
      throw new Error("Authentication failed");
    }
  });