/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  },
  webpack: config => {
    config.watchOptions.poll = 300
    config.watchOptions.aggregateTimeout = 1000

    return config
  }
}

module.exports = nextConfig
