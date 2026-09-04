/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emits a self-contained server bundle so the Docker image does not need to
  // carry node_modules — required for the on-prem deployment target.
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
