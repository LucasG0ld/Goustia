import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@recettes/domain"],
  typedRoutes: true,
};

export default nextConfig;
