const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^localhost$/i,
  /^::1$/,
  /^\[::1\]$/,
  /^169\.254\./,
];

const BLOCKED_HOSTNAMES = ['localhost', 'metadata.google.internal', '169.254.169.254'];

export function validateUrl(urlString: string): { valid: boolean; error?: string } {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
  }

  const hostname = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    return { valid: false, error: 'This URL is not allowed' };
  }

  for (const pattern of PRIVATE_IP_RANGES) {
    if (pattern.test(hostname)) {
      return { valid: false, error: 'Private network URLs are not allowed' };
    }
  }

  if (hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { valid: false, error: 'Internal hostnames are not allowed' };
  }

  return { valid: true };
}

export function normalizeUrl(urlString: string): string {
  const url = new URL(urlString);
  if (!url.pathname.endsWith('/') && !url.pathname.includes('.')) {
    url.pathname += '/';
  }
  return url.toString();
}
