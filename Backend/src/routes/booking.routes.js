import express from "express"
import { authenticateUser, authoriseAdmin } from "../middlewares/auth.middlewares.js";
import { createBooking } from "../controllers/booking.contollers.js";
import asyncHandler from "../middlewares/asyncHandler.js";
const router = express.Router();
router.post("/", authenticateUser, asyncHandler(createBooking))
export default router