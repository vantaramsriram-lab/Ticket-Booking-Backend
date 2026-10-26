import express from "express"
import { webhookHandler } from "../controllers/webhook.contollers.js";
const router = express.Router();
router.post("/payment", 
  express.raw({type: "application/json"}),
  webhookHandler
)
export default router