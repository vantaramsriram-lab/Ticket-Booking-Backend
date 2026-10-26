import express from "express"
import { authenticateUser, authoriseAdmin } from "../middlewares/auth.middlewares.js";
import { createEvent, getEvents, getEventById } from "../controllers/events.controllers.js";
import asyncHandler from "../middlewares/asyncHandler.js";
const router = express.Router();
router.get("/", asyncHandler(getEvents))
router.get("/:eventId", asyncHandler(getEventById))
router.post("/", authenticateUser, authoriseAdmin,  asyncHandler(createEvent))
export default router