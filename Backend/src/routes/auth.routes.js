import express from "express"
import { register, login, getMe} from "../controllers/auth.controllers.js";
import { registerSchema, } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.middlewares.js";
import { authenticateUser, authoriseAdmin } from "../middlewares/auth.middlewares.js";
import asyncHandler from "../middlewares/asyncHandler.js";
const router = express.Router();
router.post("/register", validate(registerSchema), asyncHandler(register))
router.post("/login",asyncHandler(login))
router.get("/me", authenticateUser, asyncHandler(getMe));
router.get("/admin/ping", authenticateUser, authoriseAdmin, asyncHandler(getMe));
export default router