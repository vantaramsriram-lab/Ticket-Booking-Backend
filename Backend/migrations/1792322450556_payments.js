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
  pgm.createTable("payments", {
    id: {
      type: "serial",
      primaryKey: true
    },
    booking_id: {
      type: "integer",
      references: "bookings",
      notNull: true,
      onDelete: "RESTRICT"
    },
    user_id: {
      type: "integer",
      references: "users",
      notNull: true,
      onDelete: "RESTRICT"
    },
    amount: {
      type: "numeric(12,2)",
      notNull: true,
      check: "amount > 0",
    },
    status: {
      type: "varchar(20)",
      notNull: true,
      default: "pending",
      check: "status IN ('pending', 'succeeded', 'failed', 'needs_refund')",
    },
    idempotency_key: {
      type: "varchar(255)",
      notNull: true,
    },
    gateway_payment_id: {
      type: "varchar(255)",
    },
    created_by: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("NOW()"),
    },
    updated_by: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("NOW()")
    },
  })

  pgm.addConstraint("payments", "payments_user_idempotency_key_unique", {
    unique: ["user_id", "idempotency_key"]
  })

  pgm.createIndex("payments", "gateway_payment_id", {
    name: "payments_gateway_payment_id_unique",
    unique: true,
    where: "gateway_payment_id IS NOT NULL",
  })
  pgm.createIndex("payments", "booking_id");
  pgm.createIndex("payments", "user_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => { 
  pgm.dropTable("payments");
};
