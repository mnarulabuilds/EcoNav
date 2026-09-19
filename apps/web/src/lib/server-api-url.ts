/** Upstream Fastify API (server-only). */
export function getServerApiUrl(): string {
  return (
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3001'
  ).replace(/\/$/, '');
}
