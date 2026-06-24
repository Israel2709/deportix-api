/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Firebase Admin SDK is a server-only Node.js dependency; never bundle it for the client/edge.
  serverExternalPackages: ['firebase-admin'],
};

export default nextConfig;
