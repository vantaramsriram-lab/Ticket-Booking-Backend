import express from "express"
import {authenticateUser, authoriseAdmin} from "../middlewares/auth.middlewares.js"
import asyncHandler from "../middlewares/asyncHandler.js"
import { addVenue, getVenues, getVenueById } from "../controllers/venue.controllers.js";
const router = express.Router();
router.get("/", asyncHandler(getVenues));
router.get("/:id", asyncHandler(getVenueById));
router.post("/", authenticateUser, authoriseAdmin, asyncHandler(addVenue))
export default router