import pool from "../db/pool.js"
import AppError from "../utils/appError.js";
export const getEvents = async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = Number(page);
    limit = Number(limit)
    if (!Number.isInteger(page) || page < 1) {
      throw new AppError("Page must be an integer greater than or equal to 1", 400);
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new AppError("Limit must be between 1 and 50", 400);
    }
    const offset = (page - 1) * limit;
    const result = await pool.query(`
      SELECT
                e.id,
                e.name,
                e.description,
                e.start_time,
                e.end_time,
                e.price,
                v.name AS venue,
                v.location AS location
            FROM events e
            JOIN venues v
                ON e.venue_id = v.id
            ORDER BY e.start_time asc, e.id asc
            limit $1 offset $2

      `, [limit, offset])
    const totalEvents = await pool.query(
      `
        select count(*) as total
         from events
        `
    )
    const total = Number(totalEvents.rows[0].total)
    const totalPages = Math.ceil(total / limit)
    res.status(200).json({
      events: result.rows,
      page,
      limit,
      total,
      totalPages,
    })
  } catch (error) {
    next(error)
  }
};
export const getEventById = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const resultEvent = await pool.query(
      `
      SELECT
        e.id,
        e.venue_id,
        e.name,
        e.description,
        e.start_time,
        e.end_time,
        e.price,
        v.name AS venue,
        v.location AS location,
        v.capacity AS capacity
      FROM events e
      JOIN venues v ON e.venue_id = v.id
      WHERE e.id = $1
      `, [eventId]
    )

    if (resultEvent.rows.length === 0) {
      throw new AppError("Event not found", 404);
    }
    const eventSeats = await pool.query(
      `
      select e.id, s.seat_number
      from event_seats e
      join seats s on s.id = e.seat_id
      where e.event_id = $1
      and e.status = 'available'
      `, [eventId]
    )
    res.status(200).json({
      event: resultEvent.rows[0],
      availbleSeats: eventSeats.rows
    });
  } catch (error) {
    next(error)
  }
}
export const createEvent = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN")

    const { venueId, name, description, startTime, endTime, price } = req.body;

    const existingEvent = await client.query(
      `
    SELECT id
    FROM events
    WHERE venue_id = $1
      AND start_time < $3
      AND end_time > $2
    LIMIT 1
    `,
      [venueId, startTime, endTime]
    );

    if (existingEvent.rows.length > 0) {
      throw new AppError(
        "An event is already scheduled at this venue during this time",
        409
      );
    }

    const eventResult = await client.query(
      `insert into events (venue_id, name, description, start_time, end_time, price)
    values($1, $2, $3, $4, $5, $6)
    returning id, venue_id, name, description, start_time, end_time, price
    `,
      [venueId, name, description, startTime, endTime, price]
    );
    const eventId = eventResult.rows[0].id

    const venueResult = await client.query(
      `select * from venues where venues.id = $1
      `, [eventResult.rows[0].venue_id]
    )
    if (!venueResult.rowCount) {
      throw new AppError("Venue not found", 404)
    }
    const capacity = venueResult.rows[0].capacity
    for (let i = 1; i <= capacity; i++) {
      await client.query(`
          insert into event_seats (event_id, seat_id)
          values ($1, $2)
        `, [eventId, i])
    }
    await client.query("COMMIT");
    res.status(201).json({
      message: "Event created successfully",
      eventId,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error)
  } finally {
    client.release()
  }
};
