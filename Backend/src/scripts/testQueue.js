import "dotenv/config";
import { bookingQueue } from "../queues/bookingQueue.js";

try {
  const job = await bookingQueue.add("test-job", {
    message: "Testing Redis and BullMQ",
  });

  console.log("Job added:", job.id);
} catch (error) {
  console.error("Failed to enqueue job:", error.message);
  process.exitCode = 1;
} finally {
  await bookingQueue.close();
}