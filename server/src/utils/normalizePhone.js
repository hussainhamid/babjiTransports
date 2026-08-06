export function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, ""); // strip everything but digits
  const last10 = digits.slice(-10); // keep the last 10 (India-specific assumption)
  return `+91${last10}`;
}
