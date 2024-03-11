/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['panic.karpatkey.com', 'localhost', 'panic.karpatkey.dev']
  },
  experimental: {
    externalDir: true
  }
}

module.exports = nextConfig
