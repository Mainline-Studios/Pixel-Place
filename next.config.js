/** @type {import('next').NextConfig} */
const isFirebaseAppHostingBuild = process.env.NEXT_PRIVATE_STANDALONE === 'true';

const nextConfig = {
  // Firebase App Hosting's Next adapter forces standalone mode via NEXT_PRIVATE_STANDALONE.
  // Keep static export for regular Hosting deploys, but disable it for App Hosting builds.
  ...(isFirebaseAppHostingBuild ? {} : { output: 'export' }),
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
