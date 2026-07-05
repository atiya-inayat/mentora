/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["6b19-103-216-135-3.ngrok-free.app"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/:path*`,
      },
      {
        source: "/socket.io",
        destination: `${process.env.BACKEND_URL || "http://localhost:5000"}/socket.io`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${process.env.BACKEND_URL || "http://localhost:5000"}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
