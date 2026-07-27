export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    credentials: 'include',
    ...options,
  });

  // If response is not OK, try to read error as JSON, fall back to text
  if (!res.ok) {
    const text = await res.text();
    let message = `Request failed (${res.status})`;
    try {
      const json = JSON.parse(text);
      message = json.error || json.message || message;
    } catch {
      // response was HTML or non-JSON — use status text
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        message = res.status === 401 ? 'Unauthorized' : `Server error (${res.status})`;
      }
    }
    throw new Error(message);
  }

  return res;
}
