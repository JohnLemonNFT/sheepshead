/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Configure for future Capacitor integration
  output: 'export',

  // Disable image optimization for static export (will use native for mobile)
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
