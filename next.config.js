/** @type {import('next').NextConfig} */
const isAppHostingAdapterBuild = process.env.NEXT_PRIVATE_STANDALONE === 'true';

const nextConfig = {
  // Firebase App Hosting's Next.js adapter needs standalone output artifacts.
  // Keep static export for Firebase Hosting, but disable export for adapter builds.
  ...(isAppHostingAdapterBuild ? {} : { output: 'export' }),
  images: {
    unoptimized: true
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /[\\/]components[\\/]Games[\\/](CityLife|HideAndSeek|GhostInTheDark|MusicalMayhem|InternationalSportsHQ)\.tsx$/,
      use: {
        loader: 'ignore-loader'
      }
    });
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
