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
  pgm.createTable("events", {
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
    name: {
      type: "varchar(150)",
      notNull: true
    },
    description: {
      type: "text"
    },
    start_time: {
      type: "timestamp",
      notNull: true
    }
  })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => { 
  pgm.dropTable("events")
};
