export function queryRetry(failureCount: number) {
  if (failureCount >= 3) {
    return false;
  }

  const delay = Math.min(1000 * 2 ** (failureCount - 1), 30_000);

  return new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(true), delay);
  });
}
