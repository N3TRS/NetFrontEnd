const USER_COLORS = [
  "#7C3AED",
  "#F97316",
  "#2563EB",
  "#16A34A",
  "#DB2777",
  "#0891B2",
  "#CA8A04",
  "#DC2626",
] as const;

export function hashEmail(email: string): number {
  let h = 0;
  for (let i = 0; i < email.length; i += 1) {
    h = (h * 31 + email.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getUserColor(email: string): string {
  return USER_COLORS[hashEmail(email) % USER_COLORS.length];
}
