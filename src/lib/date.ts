/**
 * Returns today's business date normalized to 00:00:00 UTC based on Asia/Jakarta (WIB) timezone.
 * This guarantees consistent daily queue resets and filtering regardless of server location.
 */
export function getJakartaBusinessDate(date: Date = new Date()): Date {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateString = formatter.format(date); // YYYY-MM-DD
  return new Date(`${dateString}T00:00:00.000Z`);
}
