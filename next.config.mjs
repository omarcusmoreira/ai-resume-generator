import nextPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      issuer: { and: [/\.(js|ts|md)x?$/] },
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);

