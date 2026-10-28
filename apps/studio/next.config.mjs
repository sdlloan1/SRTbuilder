/** @type {import('next').NextConfig} */
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

// In the Base44 preview the dev server is reached through the public proxy host,
// which Next 15 treats as a cross-origin dev request unless it is allowlisted.
// Only active when BASE44_PREVIEW_MODE is exactly "1".
const previewOrigins =
  process.env.BASE44_PREVIEW_MODE === '1'
    ? [
        process.env.BASE44_PUBLIC_HOST_SUFFIX ? `3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}` : null,
        process.env.BASE44_SANDBOX_HOST_DOMAIN ? `*.${process.env.BASE44_SANDBOX_HOST_DOMAIN}` : null,
      ].filter(Boolean)
    : [];

export default {
  reactStrictMode: true,
  transpilePackages: ['@srt/bridge'],
  allowedDevOrigins: previewOrigins,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? API_INTERNAL_URL,
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_INTERNAL_URL}/api/:path*` },
      { source: '/docs', destination: `${API_INTERNAL_URL}/docs` },
      { source: '/docs/:path*', destination: `${API_INTERNAL_URL}/docs/:path*` },
    ];
  },
};
