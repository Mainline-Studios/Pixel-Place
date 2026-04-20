/** @type {import('next').NextConfig} */
const isAppHostingBuild = Boolean(
  process.env.FIREBASE_CONFIG || process.env.FIREBASE_WEBAPP_CONFIG
);

const nextConfig = {
  // Firebase App Hosting's Next adapter requires server/standalone output.
  // Keep static export for legacy Hosting builds, but disable it on App Hosting.
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
