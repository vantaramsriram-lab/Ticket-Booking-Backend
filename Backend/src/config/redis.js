import { Redis } from "ioredis"
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL is missing from .env");
}
export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});
redisConnection.on("connect", () => {
  console.log("Redis connected");
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});