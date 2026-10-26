import express from "express"
import { configDotenv } from "dotenv"

import authRouter from "./routes/auth.routes.js"
import venueRouter from "./routes/venue.routes.js"
import eventRouter from "./routes/events.routes.js"
import bookingRouter from "./routes/booking.routes.js"
import webhookRouter from "./routes/webhook.routes.js"
import paymentRouter from "./routes/payment.routes.js"
import errorHandler from "./middlewares/error.middlewares.js"
import pool from "./db/pool.js"
configDotenv();
const app = express();
app.use("/api/webhook", webhookRouter)
app.use(express.json())
app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT 2 + 9");
    res.status(200).json({
      result,
      message: "connection successfull"
    })
  }
  catch (error) {
    console.error(error);

    res.status(500).json({
      status: "ERROR",
      database: "disconnected"
    });
  }
})
app.use("/api/auth", authRouter)
app.use("/api/events", eventRouter);
app.use("/api/venues", venueRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentRouter);

app.use(errorHandler)
const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server Started at port ${port}`)
})