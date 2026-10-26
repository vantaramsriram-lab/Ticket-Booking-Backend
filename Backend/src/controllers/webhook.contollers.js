import pool from "../db/pool.js"
import { bookingQueue } from "../queues/bookingQueue.js"
import { createWebhookEvent } from "../services/webhookEvent.services.js"
import AppError from "../utils/appError.js"
import { verifyWebHookSignature } from "../utils/webHookSignature.js"

export const webhookHandler = async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const secret = process.env.WEBHOOK_KEY
    if (!secret) {
      throw new AppError("webhook key is not configured", 500)
    }

    const valid = verifyWebHookSignature(
      req.body,
      req.get("x-signature"), //shorthand for req.headers['x-signature']
      secret
    )
    if (!valid) {
      throw new AppError("Invalid webhook signature", 401)
    }
    let event;
    try {
      event = JSON.parse(req.body.toString("utf8"))
    } catch {
      throw new AppError("JSON PAYLOAD Error", 400)
    }
    const { id: eventId, type, data } = event;

    if (!eventId || !type || !data?.paymentId || !data?.gatewayTransactionId) {
      throw new AppError("Invalid webhook event structure", 400);
    }
    const webhookeventResult = await createWebhookEvent(event, client);
    
    if (!webhookeventResult) {
      await client.query("ROLLBACK")
      return res.status(200).json({
        received: true,
        duplicate: true,
      });
    }
    
    const paymentStatus =
      type === "payment.succeeded" ? "succeeded" : "failed";
    const paymentResult = await client.query(`
      update payments
      set status = $1,
      gateway_payment_id = $2,
      updated_by = NOW()
      where id = $3
      returning id, booking_id
      `, [paymentStatus, data.gatewayTransactionId, data.paymentId])
      
    if (paymentResult.rowCount === 0) {
      throw new AppError("Payment not found", 404);
    }
    const { booking_id: bookingId } = paymentResult.rows[0];
    if (paymentStatus === "succeeded") {
      await client.query(
        `UPDATE bookings
         SET status = 'confirmed'
         WHERE id = $1`,
        [bookingId]
      );
    }
    await client.query(
      `UPDATE webhook_events
       SET status = 'processed',
           processed_at = NOW()
       WHERE event_id = $1`,
      [eventId]
    );
    await client.query("COMMIT")
    await bookingQueue.add("send-booking-confirmation", {bookingId});
    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    await client.query("ROLLBACK")
    next(error)
  } finally {
    client?.release()
  }
}