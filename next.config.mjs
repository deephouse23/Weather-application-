import { withSentryConfig } from "@sentry/nextjs";

// Bundle analyzer (only enabled when ANALYZE=true)
// Use dynamic import to avoid ES module issues
let withBundleAnalyzer = (config) => config;
if (process.env.ANALYZE === 'true') {
  const bundleAnalyzer = require('@next/bundle-analyzer');
  withBundleAnalyzer = bundleAnalyzer.default({
    enabled: true,
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: ESLint config moved to eslint.config.mjs (Next.js 16+)
  // To ignore during builds, use: ESLINT_NO_DEV_ERRORS=true or run lint separately
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.openweathermap.org',
      },
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Fix turbopack root detection with multiple lockfiles
  turbopack: {
    root: process.cwd(),
  },

  // Compression for better performance
  compress: true,


  // Optimize for production
  productionBrowserSourceMaps: false,

  // Add headers for better caching and security
  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // HSTS - enforce HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://vercel.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://api.openweathermap.org https://pollen.googleapis.com https://www.google.com https://*.supabase.co https://*.sentry.io https://vitals.vercel-insights.com https://mesonet.agron.iastate.edu https://tile.openstreetmap.org",
              "worker-src 'self' blob:",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              // Only enable upgrade-insecure-requests in production; it breaks local http dev
              // by upgrading same-origin asset requests (notably in WebKit).
              ...(isProd ? ["upgrade-insecure-requests"] : [])
            ].join('; ')
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          },
        ],
      },
      {
        // Cache static assets
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache fonts
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache all static media files (path-to-regexp with regex parameter)
        source: '/:path*.:ext(svg|jpg|jpeg|png|webp|avif|woff|woff2|ttf|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Redirect old sitemap.xml to new dynamic sitemap
  async redirects() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap',
        permanent: true,
      },
    ]
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: false, // CSS optimization disabled - not helping performance
    scrollRestoration: true,
    // instrumentationHook removed - now available by default in Next.js 15
  },

  // PERFORMANCE: Enable compiler optimizations
  compiler: {
    // Remove console logs in production (except errors)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // PERFORMANCE: Code splitting for large dependencies
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Separate OpenLayers into its own chunk (~400KB)
          openlayers: {
            test: /[\\/]node_modules[\\/](ol)[\\/]/,
            name: 'openlayers',
            chunks: 'all',
            priority: 30,
          },
          // Separate Sentry into its own chunk (~200KB)
          sentry: {
            test: /[\\/]node_modules[\\/](@sentry)[\\/]/,
            name: 'sentry',
            chunks: 'all',
            priority: 20,
          },
        },
      }
    }
    return config
  },
}

export default withBundleAnalyzer(withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG || "16bitweather",
  project: process.env.SENTRY_PROJECT || "javascript-nextjs",

  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/instrumentation/automatic-instrumentation/
  automaticVercelMonitors: true,
}));
