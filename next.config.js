/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      NEXT_PUBLIC_TWITCH_CLIENT_ID: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
      NEXT_PUBLIC_TWITCH_CLIENT_SECRET: process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET,
      NEXT_PUBLIC_STEAM_API_KEY: process.env.NEXT_PUBLIC_STEAM_API_KEY
    }
  }
  
  module.exports = nextConfig