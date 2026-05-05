/** @type {import('next').NextConfig} */
const isAppHostingBuild =
  process.env.APPHOSTING === '1' ||
  typeof process.env.FIREBASE_WEBAPP_CONFIG === 'string';

const nextConfig = {
  // Static export is required for legacy Firebase Hosting deploys, but App Hosting
  // needs a server-capable Next.js build because this repository includes app/api routes.
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
