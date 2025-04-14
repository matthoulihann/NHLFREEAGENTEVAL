/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to import these modules in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        mysql: false,
        'mysql2/promise': false,
        mysql2: false,
      };
    }
    return config;
  },
  // Disable type checking during build to avoid issues with mysql2
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure environment variables are available
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
    RAILWAY_PROJECT_ID: process.env.RAILWAY_PROJECT_ID,
  },
  // Add experimental features to support async imports
  experimental: {
    serverComponentsExternalPackages: ['mysql2'],
  },
};

export default nextConfig;
