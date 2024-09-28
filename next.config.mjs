import nextPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
};

export default nextPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
