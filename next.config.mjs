/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  transpilePackages: ["three"],
  reactStrictMode: true,
  webpack: (config) => {
    // Silence Windows drive-letter casing cache warning (d:\ vs D:\)
    config.infrastructureLogging = {
      level: "error",
    };
    return config;
  },
};

export default nextConfig;
