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
  pgm.createTable("seats", {
    id: {
      type: "serial",
      primaryKey: true
    },
    venue_id: {
      type: "integer",
      notNull: true,
      references: "venues",
      onDelete: "RESTRICT"
    },
    seat_number: {
      type: "varchar(20)",
      notNull: true
    }
  });
  pgm.addConstraint("seats", "unique_venue_seat", {
    unique: ["venue_id", "seat_number"]
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("seats")
};
