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
  pgm.createTable("event_seats", {
    id: {
      type: "serial",
      primaryKey: true
    },
    event_id: {
      type: "integer",
      notNull: true,
      references: "events",
      onDelete: "RESTRICT"
    },
    seat_id: {
      type: "integer",
      notNull: true,
      references: "seats",
      onDelete: "RESTRICT"
    },
    status: {
      type: "varchar(20)",
      notNull: true,
      default: "available"
    }
  })
  pgm.addConstraint("event_seats", "unique_event_seat", {
    unique: ["event_id", "seat_id"]
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("event_seats");
};
