import crypto from "node:crypto"
const MAX_AGE_SECONDS = 5 * 60;
export const createWebhookSignature = (rawBody, secret) => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.`, "utf8")
    .update(rawBody)
    .digest("hex");
  return {
    timestamp,
    header: `t=${timestamp},v1=${signature}`
  }
}
export const verifyWebHookSignature = (rawBody,
  signatureHeader,
  secret) => {
  if (!Buffer.isBuffer(rawBody) || !signatureHeader || !secret) {
    return false
  }
  const match = signatureHeader.match(
    /^t=(\d+),v1=([a-f0-9]{64})$/
  );
  if (!match) return false;
  const [, timestamp, recievedSignature] = match;
  const timestampNumber = Number(timestamp);
  const now = Math.floor(Date.now() / 1000);

  if (
    !Number.isSafeInteger(timestampNumber) ||
    Math.abs(now - timestampNumber) > MAX_AGE_SECONDS
  ) {
    return false;
  }

  const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${timestamp}.`, "utf8")
        .update(rawBody)
        .digest();
  const receivedBuffer = Buffer.from(recievedSignature, "hex")
  if (expectedSignature.length !== receivedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    expectedSignature, receivedBuffer
  )
}