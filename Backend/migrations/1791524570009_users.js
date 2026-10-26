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
  pgm.createTable("users", {
    id: {
      type: "serial",
      primaryKey: true
    },
    name: {
      type: "varchar(50)",
      notNull: true
    },
    email: {
      type: "varchar(255)",
      notNull: true,
      unique: true
    },
    password: {
      type: "varchar(255)",
      notNull: true
    },
    role: {
      type: "varchar(20)",
      notNull: true,
      default: "user",
      check: "role IN ('user', 'admin')"
    },
    created_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp")
    }
  })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("users")
};
