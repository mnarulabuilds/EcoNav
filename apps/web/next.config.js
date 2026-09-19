/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@econav/core', '@econav/platform'],
};

module.exports = nextConfig;
