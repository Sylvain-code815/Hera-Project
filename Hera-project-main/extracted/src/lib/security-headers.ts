// Centralised HTTP security headers, applied to every SSR response in server.ts.
//
// CSP notes:
//  - script-src keeps 'unsafe-inline' because TanStack Start emits inline
//    hydration scripts without a nonce. Tightening this to a nonce/hash strategy
//    is the next hardening step.
//  - style-src allows 'unsafe-inline' for Tailwind's injected styles, the inline
//    style={{ height }} attributes, and the shadcn chart <style> tag.
//  - fonts.googleapis.com / fonts.gstatic.com cover the Google Fonts in __root.tsx.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self'",
].join("; ");

/**
 * Mutates `headers` in place with our baseline security headers.
 *
 * The CSP and HSTS are only emitted in production: in dev they would block
 * Vite's HMR websocket and inline eval, breaking the dev server.
 */
export function applySecurityHeaders(headers: Headers, isProd: boolean) {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), interest-cohort=()");

  if (isProd) {
    headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
}

/**
 * Returns a new Response carrying the original body/status plus security headers.
 * We rebuild the Response (rather than mutating response.headers) because some
 * SSR responses are returned with an immutable headers guard.
 */
export function withSecurityHeaders(response: Response, isProd: boolean): Response {
  const headers = new Headers(response.headers);
  applySecurityHeaders(headers, isProd);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
