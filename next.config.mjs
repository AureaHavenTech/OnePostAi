/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/dashboard/schedule',
        destination: '/dashboard/calendar',
        permanent: true,
      },
    ]
  },
};
export default nextConfig;