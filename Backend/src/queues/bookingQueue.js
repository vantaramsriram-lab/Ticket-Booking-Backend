import {Queue} from "bullmq"
import { redisConnection } from "../config/redis.js"
export const bookingQueue = new Queue("booking-jobs", {
  connection: redisConnection,
  defaultJobOptions:{
    attempts: 3,
    backoff:{
      type: "exponential",
      delay: 2000
    },
    removeOnComplete:{
      age: 24*60*60
    },
    removeOnFail: false
  }
})
