/** Georgian month names for deterministic SSR-safe date formatting */
const KA_MONTHS = [
  "იანვარი",
  "თებერვალი",
  "მარტი",
  "აპრილი",
  "მაისი",
  "ივნისი",
  "ივლისი",
  "აგვისტო",
  "სექტემბერი",
  "ოქტომბერი",
  "ნოემბერი",
  "დეკემბერი",
];

/**
 * Format date string for display. Uses date parts only (no timezone),
 * so server and client render the same (avoids hydration mismatch).
 * Safe to call from both Server and Client components.
 */
export function formatNewsDate(dateStr: string): string {
  if (!dateStr || typeof dateStr !== "string") return "";
  const s = dateStr.trim();
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth();
    const day = d.getUTCDate();
    return `${day} ${KA_MONTHS[m]} ${y}`;
  }
  const [, y, month, day] = match;
  const m = parseInt(month!, 10) - 1;
  if (m < 0 || m > 11) return "";
  return `${parseInt(day!, 10)} ${KA_MONTHS[m]} ${y}`;
}
