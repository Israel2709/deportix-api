/** @type {import('next').NextConfig} */
import os from 'node:os';

function localLanHostnames() {
  const hosts = new Set();
  for (const ifaces of Object.values(os.networkInterfaces())) {
    if (!ifaces) continue;
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        hosts.add(iface.address);
      }
    }
  }
  return [...hosts];
}

function lanDevOrigins() {
  const fromEnv = (process.env.ALLOWED_DEV_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...fromEnv, ...localLanHostnames()];
}

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: lanDevOrigins(),
  // Firebase Admin SDK is a server-only Node.js dependency; never bundle it for the client/edge.
  serverExternalPackages: ['firebase-admin'],
};

export default nextConfig;
