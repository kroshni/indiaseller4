/** @type {import('next').NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.freepik.com'
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com'
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com'
      }
    ]
  },
};

export default config;
