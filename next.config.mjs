/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_JWT_SECRET_KEY: process.env.NEXT_PUBLIC_JWT_SECRET_KEY,
    NEXT_PUBLIC_ALGORITHM: process.env.NEXT_PUBLIC_ALGORITHM,
  },
  allowedDevOrigins: [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
  ],
};

export default nextConfig;
