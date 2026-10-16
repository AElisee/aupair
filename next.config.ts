import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Autorise l'accès au serveur de dev depuis le réseau local (test mobile)
  allowedDevOrigins: ["192.168.1.76"],
};

export default nextConfig;
