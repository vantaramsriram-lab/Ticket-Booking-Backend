import "dotenv/config";
import { Worker } from "bullmq";
import { sendConfirmationEmail, releaseExpiredHold } from "../services/booking.services,.js"
import { redisConnection } from "../config/redis.js";
const worker = new Worker("booking-jobs",
  async (job) => {
    console.log("Processing job:", job.name, job.data);
    if (job.name.toString() === "send-booking-confirmation") {
      return await sendConfirmationEmail(job.data.bookingId)
    }
    else if (job.name.toString() === "release-expired-hold") {
      return await releaseExpiredHold(job.data.eventSeatId, job.data.bookingId)
    }
    else {
      throw new Error(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
)
worker.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("Worker error:", err.message);
});

console.log("Booking worker started");
async function shutdown() {
  await worker.close()
  await redisConnection.quit()
  process.exit(0)
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);