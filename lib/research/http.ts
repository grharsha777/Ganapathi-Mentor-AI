export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 2,
  backoffMs = 350,
): Promise<Response> {
  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= retries) {
    try {
      const response = await fetch(input, init);
      if (response.ok || (response.status < 500 && response.status !== 429)) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < retries) {
      const delay = backoffMs * (2 ** attempt);
      await sleep(delay);
    }

    attempt += 1;
  }

  throw lastError instanceof Error ? lastError : new Error('Network request failed');
}
