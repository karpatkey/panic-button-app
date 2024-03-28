/** @type {import('next').NextConfig} */

module.exports = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['agile.karpatkey.com', 'localhost', 'agile.karpatkey.dev'],
  },
  experimental: {
    externalDir: true,
  },
}
