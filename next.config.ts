import { env } from '@/env'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [env.NEXT_PUBLIC_STORAGE_URL]?.map((item) => {
      const url = new URL(item)
      return {
        protocol: 'https',
        hostname: url.hostname,
      }
    }),
  },
  env: env,
}

export default nextConfig
