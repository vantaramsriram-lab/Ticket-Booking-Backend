import pool from "../db/pool.js";
import AppError from "../utils/appError.js";

export const createPayment = async ({ bookingId, userId }) => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const bookingDetails = await client.query(`
      select 
      b.id as booking_id, b.user_id, e.price, b.status as booking_status
      from bookings b
      join event_seats es on b.event_seat_id = es.id
      join events e on es.event_id = e.id
      where b.id = $1 and b.user_id = $2
      for update of b
      `, [bookingId, userId])
    if (bookingDetails.rowCount === 0) {
      throw new AppError("Booking details Not found", 404)
    }
    if (bookingDetails.rows[0].booking_status !== "held") {
      throw new AppError(`Cannot pay for a booking with status ${bookingDetails.rows[0].booking_status}`, 400);
    }
    const booking = bookingDetails.rows[0]
    const paymentResult = await client.query(
      `
      insert into payments (
        booking_id,
        user_id,
        amount,
        status,
        idempotency_key
      )
      values($1, $2, $3, $4, $5)
      returning id,
        booking_id,
        user_id,
        amount,
        status,
        created_by
      `, [booking.booking_id, userId, booking.price, 'pending', `booking-${bookingId}`]
    )
    await client.query("COMMIT")
    return paymentResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK")
    throw error;
  } finally {
    client.release()
  }
}