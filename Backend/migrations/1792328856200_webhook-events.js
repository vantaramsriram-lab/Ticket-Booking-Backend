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
  pgm.createTable("webhook_events", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },

    event_id: {
      type: "varchar(255)",
      notNull: true,
      unique: true,
    },

    type: {
      type: "varchar(100)",
      notNull: true,
    },

    payload: {
      type: "jsonb",
      notNull: true,
    },

    received_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("NOW()"),
    },

    processed_at: {
      type: "timestamptz",
    },

    status: {
      type: "varchar(20)",
      default: "failed",
      notNull: true,
      check: "status IN ('processed', 'ignored', 'failed')",
    },
  });

  pgm.createIndex("webhook_events", "status");
  pgm.createIndex("webhook_events", "received_at");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("webhook_events")
};
