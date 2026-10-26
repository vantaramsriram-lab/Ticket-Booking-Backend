import pool from "../db/pool.js";
import AppError from "../utils/appError.js";
import { sendEmail } from "./email.services.js";
async function releaseExpiredHold(eventSeatId, bookingId) {
  if (!eventSeatId || !bookingId) {
    throw new AppError("eventSeatId or bookingId not found", 400);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the seat row to prevent concurrent modifications.
    const eventSeatResult = await client.query(
      `SELECT id, status
       FROM event_seats
       WHERE id = $1
       FOR UPDATE`,
      [eventSeatId]
    );
    const bookingResult = await client.query(`
      select id, status, hold_expires_at
      from bookings 
      where id = $1
      `, [bookingId])

    if (eventSeatResult.rowCount === 0) {
      throw new AppError("Event seat not found", 404);
    }
    if(bookingResult.rowCount === 0){
      throw new AppError("Booking result not found", 404);
    }
    const booking = bookingResult.rows[0];
    const seat = eventSeatResult.rows[0];

    // Don't release a seat that is no longer held by this booking.
    if (
      seat.status !== "held"
    ) {
      await client.query("ROLLBACK");
      return { released: false, reason: "Hold no longer active" };
    }

    // Confirm that the hold has actually expired.
    if (new Date(booking.hold_expires_at) > new Date()) {
      await client.query("ROLLBACK");
      return { released: false, reason: "Hold has not expired" };
    }

    await client.query(
      `UPDATE event_seats
       SET status = 'available'
       WHERE id = $1`,
      [eventSeatId]
    );

    await client.query(
      `UPDATE bookings
       SET status = 'expired'
       WHERE id = $1
         AND status = 'held'`,
      [bookingId]
    );

    await client.query("COMMIT");

    return { released: true };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => { });
    throw error;
  } finally {
    client.release();
  }
}
async function sendConfirmationEmail(bookingId) {
  if (!bookingId) {
    throw new AppError("bookingId not found", 400);
  }

  const result = await pool.query(
    `SELECT
       b.id AS booking_id,
       b.status AS booking_status,
       u.name AS customer_name,
       u.email AS customer_email,
       e.name AS event_title,
       b.booked_at AS booking_date
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     JOIN event_seats es on es.id = b.event_seat_id
     JOIN events e ON e.id = es.event_id
     WHERE b.id = $1`,
    [bookingId]
  );

  if (result.rowCount === 0) {
    throw new AppError("Booking not found", 404);
  }

  const booking = result.rows[0];

  // Only send confirmation for a confirmed booking.
  if (booking.booking_status !== "confirmed") {
    throw new AppError("Booking is not confirmed", 400);
  }

  await sendEmail({
    to: booking.customer_email,
    subject: `Booking Confirmation #${booking.booking_id}`,
    text: `Hello ${booking.customer_name},
    Your booking has been confirmed!
    Booking ID: ${booking.booking_id}
    Event: ${booking.event_title}
    Booking Date: ${new Date(booking.booking_date).toLocaleString("en-IN")}
    Thank you for booking with us.`,
  });

  return {
    sent: true,
    bookingId: booking.booking_id,
  };
}
export {releaseExpiredHold, sendConfirmationEmail}