import pool from "../db/pool.js";
import AppError from "../utils/appError.js";
export const getVenues = async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
      throw new AppError(
        "Page must be an integer greater than or equal to 1",
        400
      );
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new AppError("Limit must be between 1 and 50", 400);
    }

    const offset = (page - 1) * limit;

    const venuesResult = await pool.query(
      `
      SELECT
        id,
        name,
        location,
        capacity
      FROM venues
      ORDER BY id ASC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    const countResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM venues
    `);

    const total = Number(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      venues: venuesResult.rows,
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    next(error);
  }
};
export const getVenueById = async (req, res, next) => {
  try {
    const { venueId } = req.params;

    const venueResult = await pool.query(
      `
      SELECT
        id,
        name,
        location,
        capacity
      FROM venues
      WHERE id = $1
      `,
      [venueId]
    );

    if (venueResult.rows.length === 0) {
      throw new AppError("Venue not found", 404);
    }

    const eventsResult = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        start_time,
        end_time
      FROM events
      WHERE venue_id = $1
        AND start_time >= NOW()
      ORDER BY start_time ASC, id ASC
      `,
      [venueId]
    );

    res.status(200).json({
      venue: venueResult.rows[0],
      upcomingEvents: eventsResult.rows
    });
  } catch (error) {
    next(error);
  }
};
export const addVenue = async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const { name, location, capacity } = req.body;

    if (!name || !location || !capacity) {
      throw new AppError("Name, Location and Capacity are required", 400);
    }
    const venueResult = await client.query(`
    insert into venues (name, location, capacity)
    values ($1, $2, $3)
    RETURNING id, name, location, capacity
    `, [name, location, capacity])
    const venueId = venueResult.rows[0].id
    for(let i = 1; i <= capacity; i++){
      await client.query(
        `
        insert into seats (venue_id, seat_number)
        values ($1, $2)
        `, [venueId, i]
      )
    }
    await client.query("COMMIT")
    res.status(201).json({
      message: "Venue created successfully",
      venue: venueResult.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK")
    next(error)
  } finally {
    client.release()
  }
};