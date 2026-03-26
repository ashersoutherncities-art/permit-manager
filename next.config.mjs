/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/permit-manager',
  assetPrefix: '/permit-manager/',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
