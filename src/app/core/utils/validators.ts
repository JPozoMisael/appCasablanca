export function isEmail(value: string): boolean {
  if (!value) return false;
  const v = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isStrongPassword(value: string, minLen = 8): boolean {
  if (!value) return false;
  const v = value.trim();
  if (v.length < minLen) return false;
  const hasUpper = /[A-Z]/.test(v);
  const hasLower = /[a-z]/.test(v);
  const hasNumber = /\d/.test(v);
  return hasUpper && hasLower && hasNumber;
}

export function onlyNumbers(value: string): string {
  return (value ?? '').replace(/\D/g, '');
}

export function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}
