import crypto from "node:crypto"
import { createWebhookSignature } from "../utils/webHookSignature.js";
import AppError from "../utils/appError.js";
const WEBHOOK_KEY = process.env.WEBHOOK_KEY
const WEBHOOK_URL = process.env.WEBHOOK_URL
export const intiateMockGateway = async ({ paymentId, amount }) => {
  if (!WEBHOOK_KEY || !WEBHOOK_URL)
    throw new Error("Mock gateway configuration is missing", 500)
  if (
    !paymentId ||
    !Number.isSafeInteger(Number(amount)) ||
    Number(amount) < 0
  ) {
    throw new Error("Invalid payment details");
  }
  const gatewayTransactionId = `mock_txn_${crypto.randomUUID()}`;
  const event = {
    id: `evt_id-${crypto.randomUUID()}`,
    type: 'payment.succeeded',
    createdAt: new Date().toISOString(),
    data: {
      paymentId: paymentId,
      gatewayTransactionId: gatewayTransactionId,
      amount: Number(amount),
      status: "success"
    }
  }
  const rawBody = JSON.stringify(event)
  const signature = createWebhookSignature(rawBody, WEBHOOK_KEY);
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-signature": `${signature.header}`
    },
    body: rawBody,
  })
  if (!response.ok) {
    throw new AppError(
      `Webhook delivery failed with HTTP`, response.status,
    );
  }
  return {
    paymentId: paymentId,
    gatewayTransactionId,
    eventId: event.id,
    deliveryStatus: "accepted",
  };
}
