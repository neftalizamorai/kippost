/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async rewrites() {
    return [
      { source: '/@:username/rss', destination: '/blog/:username/rss' },
      { source: '/@:username/:slug', destination: '/blog/:username/:slug' },
      { source: '/@:username', destination: '/blog/:username' },
    ]
  },
}

export default nextConfig
