import type { NextConfig } from 'next'

const apiBaseUrl =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: `${apiBaseUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig
