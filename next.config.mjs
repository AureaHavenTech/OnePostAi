/** @type {import('next').NextConfig} */
const nextConfig = {
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