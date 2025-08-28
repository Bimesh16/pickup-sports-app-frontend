/**
 * Generates a short request id suitable for correlation headers.
 * Not cryptographically secure.
 */
export function generateRequestId(): string {
  const rnd = () => Math.random().toString(36).slice(2, 8);
  const ts = Date.now().toString(36);
  return `${ts}-${rnd()}-${rnd()}`;
}
