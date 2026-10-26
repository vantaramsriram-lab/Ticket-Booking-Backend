import "dotenv/config";
import { verifyEmailConnection } from "../services/email.services.js";

try {
  await verifyEmailConnection();
} catch (error) {
  console.error("SMTP verification failed:", error.message);
  process.exitCode = 1;
}