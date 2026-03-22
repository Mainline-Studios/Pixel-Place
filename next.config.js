const path = require('path');

const isAppHostingBuild =
  process.env.NEXT_PRIVATE_STANDALONE === 'true' || Boolean(process.env.FIREBASE_WEBAPP_CONFIG);

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isAppHostingBuild ? {} : { output: 'export' }),
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
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname),
    };

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
