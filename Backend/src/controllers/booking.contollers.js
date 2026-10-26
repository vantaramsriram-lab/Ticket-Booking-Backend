import pool from "../db/pool.js";
import { bookingQueue } from "../queues/bookingQueue.js";
import AppError from "../utils/appError.js";

export const createBooking = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN")
    const userId = req.user.userId;
    let { eventSeatId } = req.body
    eventSeatId = Number(eventSeatId)
    if (!Number.isInteger(eventSeatId) || eventSeatId <= 0) {
      throw new AppError("Valid eventSeatId is required", 400);
    }

    // ROW LOCKING FOR CONCURRENCY CONTROL


    const eventSeatResult = await client.query(`
      select * from 
      event_seats where event_seats.id = $1
      for update
      `, [eventSeatId]);

    if (eventSeatResult.rows.length === 0) {
      throw new AppError("Not Found", 404);
    }
    let seatStatus = eventSeatResult.rows[0].status;

    // UPDATING THE EXPIRED ONES

    const expired = await client.query(`
      update bookings
      set status = 'expired'
      where event_seat_id = $1
        and status = 'held'
        and hold_expires_at <= NOW()
      returning id
      `, [eventSeatId])

    if (expired.rowCount > 0) {
      await client.query(`
          update event_seats
          set status = 'available'
          where event_seats.id = $1
          `, [eventSeatId])
      seatStatus = 'available'
    }
    if (seatStatus === "held") {
      const mine = await client.query(
        `select id, user_id, event_seat_id, status, booked_at, hold_expires_at
         from bookings
         where event_seat_id = $1 and user_id = $2 and status = 'held' and hold_expires_at > NOW()`,
        [eventSeatId, userId]
      );
      if (mine.rowCount > 0) {
        await client.query("COMMIT");
        return res.status(200).json({
          message: "You already hold this seat",
          booking: mine.rows[0],
        });
      }
    }
    if (seatStatus !== "available") {
      throw new AppError("Seat is unavailable", 409);
    }


    // // for sending the request at a time
    // await new Promise(resolve => setTimeout(resolve, 5000)); enable while testing

    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, event_seat_id, status, hold_expires_at)
             VALUES ($1, $2, 'held', NOW() + interval '5 minutes')
             RETURNING id, user_id, event_seat_id, status, hold_expires_at`,
      [userId, eventSeatId]
    );
    await client.query(
      `update event_seats set status = 'held' where id = $1`,
      [eventSeatId]
    );
    await client.query("COMMIT")
    const expires_at = bookingResult.rows[0].hold_expires_at
    const bookingId = bookingResult.rows[0].id
    await bookingQueue.add("release-expired-hold",
       { eventSeatId, bookingId },
       { delay: 5 * 60 * 1000,
         jobId: `jobId-${eventSeatId}-${expires_at}`
       })
    return res.status(201).json({
      message: "Seat held for 5 min",
      booking: bookingResult.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release()
  }
}