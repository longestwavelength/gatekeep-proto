/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }
    //config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  transpilePackages: ['react-leaflet', '@react-leaflet/core'],
}

export default nextConfig;