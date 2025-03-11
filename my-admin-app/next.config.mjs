/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "www.ita-luxury.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "app.jax-delivery.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "wamia-media.s3.eu-west-1.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "png.pngtree.com",
        pathname: "**",
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://upload-widget.cloudinary.com https://js.pusher.com https://cdn.tiny.cloud",
              "frame-src 'self' https://upload-widget.cloudinary.com",
              "connect-src 'self' https://upload-widget.cloudinary.com https://www.ita-luxury.com https://ita-luxury.com https://admin.ita-luxury.com http://localhost:4000 http://localhost:4001 https://*.pusher.com https://*.pushnotifications.pusher.com https://cdn.tiny.cloud", "style-src 'self' 'unsafe-inline' https://cdn.tiny.cloud",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'"
            ].join('; ')
          },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
    ];
  },

  // Proxy and rewrites configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://ita-luxury.com/api/:path*'
          : 'http://localhost:4000/api/:path*'
      }
    ];
  },
};

export default nextConfig;