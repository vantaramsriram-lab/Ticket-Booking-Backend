import pool from "../db/pool.js"
import { createPayment } from "../services/payment.services.js"
import AppError from "../utils/appError.js"
import { intiateMockGateway } from "../services/gateway.services.js"
export const paymentIntiater = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const { bookingId } = req.body
    if (!bookingId) throw new AppError("BookingId not found", 400)
    const paymentDetails = await createPayment({ bookingId, userId});
    const gatewayResult = await intiateMockGateway({
      paymentId: paymentDetails.id,
      amount: paymentDetails.amount
    })
    return res.status(201).json({
      message: "Payment initiated",
      paymentId: paymentDetails.id,
      status: paymentDetails.status,
      gateway: gatewayResult,
    });
  } catch (error) {
    next(error)
  } 
}