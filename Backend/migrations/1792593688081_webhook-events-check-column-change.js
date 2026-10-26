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
  pgm.dropConstraint("webhook_events", "webhook_events_status_check")
  pgm.alterColumn("webhook_events", "status", {
    default: "recieved"
  })
  pgm.addConstraint("webhook_events", "webhook_events_status_check", {
    check: "status IN ('processed', 'ignored', 'failed', 'received')",
  })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropConstraint(
    "webhook_events",
    "webhook_events_status_check"
  );

  pgm.alterColumn("webhook_events", "status", {
    default: "failed",
  });

  pgm.addConstraint("webhook_events", "webhook_events_status_check", {
    check: "status IN ('processed', 'ignored', 'failed')",
  });
};
