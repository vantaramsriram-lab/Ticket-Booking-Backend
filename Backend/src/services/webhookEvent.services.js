export async function createWebhookEvent(event, client) {
  const query = `
    INSERT INTO webhook_events (
      event_id,
      type,
      payload,
      received_at,
      processed_at,
      status
    )
    VALUES ($1, $2, $3::jsonb, NOW(), NULL, $4)
    ON CONFLICT (event_id) DO NOTHING
    RETURNING event_id, status;
  `;

  const values = [
    event.id,
    event.type,
    JSON.stringify(event),
    "received",
  ];

  const { rows } = await client.query(query, values);

  return rows[0] ?? null;
}