import type { NextConfig } from 'next'

const apiBaseUrl =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      { source: '/app/modelos-evolucao', destination: '/app/fichas', permanent: false },
      { source: '/app/prontuarios', destination: '/app/pacientes', permanent: false },
    ]
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
