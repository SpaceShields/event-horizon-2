import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Configure remote image domains for Next.js Image optimization
    remotePatterns: [
      {
        // Unsplash for stock/placeholder images
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        // Stockcake for stock/placeholder profile images
        protocol: 'https',
        hostname: 'images.stockcake.com',
        pathname: '/**',
      },
      {
        // Supabase Storage for user-uploaded images
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Google user avatars (from OAuth)
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        // Gravatar for fallback avatars
        protocol: 'https',
        hostname: 'www.gravatar.com',
        pathname: '/avatar/**',
      },
      {
        // GitHub avatars (if GitHub OAuth is added later)
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
