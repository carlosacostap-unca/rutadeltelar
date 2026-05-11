export function toValidIsoDate(value: string) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}
