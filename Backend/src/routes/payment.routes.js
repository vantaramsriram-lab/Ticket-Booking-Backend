import express from "express"
import { authenticateUser } from "../middlewares/auth.middlewares.js";
import { paymentIntiater } from "../controllers/payment.contollers.js";
import asyncHandler from "../middlewares/asyncHandler.js";
const router = express.Router();
router.post("/", authenticateUser, asyncHandler(paymentIntiater))
export default router;