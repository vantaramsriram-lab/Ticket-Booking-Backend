/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("bookings", {
    id: {
      type: "serial",
      primaryKey: true
    },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "RESTRICT"
    },
    event_seat_id: {
      type: "integer",
      notNull: true,
      references: "event_seats",
      onDelete: "RESTRICT"
    },
    status: {
      type: "varchar(20)",
      notNull: true,
      default: "confirmed"
    },
    booked_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp")
    }
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => { 
  pgm.dropTable("bookings");
};
