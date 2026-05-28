const path = require('path');
const isAppHostingStandaloneBuild = process.env.NEXT_PRIVATE_STANDALONE === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin tracing to this app (avoids picking ~/package-lock.json as workspace root).
  outputFileTracingRoot: path.join(__dirname),
  // Firebase App Hosting's Next.js adapter requires standalone output.
  output: isAppHostingStandaloneBuild ? undefined : 'export',
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
