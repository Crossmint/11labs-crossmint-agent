/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_RPC_PROVIDER_URL: process.env.NEXT_PUBLIC_RPC_PROVIDER_URL,
    NEXT_PUBLIC_WALLET_PRIVATE_KEY: process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY,
    NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID: process.env.NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID,
  },
  // other config options...
};

module.exports = nextConfig; 