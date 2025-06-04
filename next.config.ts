import { env } from '@/env'
import type { NextConfig } from 'next'

const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL!

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [storageUrl]?.map((item) => {
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
