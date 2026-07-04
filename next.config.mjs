let withBundleAnalyzer = (config) => config;

try {
  const bundleAnalyzer = (await import('@next/bundle-analyzer')).default;
  withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  });
} catch (e) {
  // @next/bundle-analyzer not found, continuing without it
  // This allows builds to succeed in environments where devDependencies are not installed
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Environment variables that should be available in the browser
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default withBundleAnalyzer(nextConfig)
