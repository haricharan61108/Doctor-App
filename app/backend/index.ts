import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import prisma from "./src/lib/prisma";
import { authRouter } from "./routes/auth";

const PORT = process.env.PORT || 3001;

const app = new Elysia()
  // CORS configuration
  .use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  // Health check endpoint
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))
  // Auth routes
  .group("/api/auth", (app) => app.use(authRouter))
  // Error handling
  .onError(({ code, error, set }) => {
    console.error(`Error [${code}]:`, error);

    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Validation failed", message: error.message };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Route not found" };
    }

    set.status = 500;
    return { error: "Internal server error", message: error.message };
  })
  .listen(PORT);

console.log(`
🚀 Server is running!
📍 URL: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
🔐 Auth: http://localhost:${PORT}/api/auth
`);

// Test database connection on startup
prisma.$connect()
  .then(() => {
    console.log("✅ Database connected successfully!");
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n👋 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
