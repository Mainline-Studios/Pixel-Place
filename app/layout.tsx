import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { UserProvider } from "@/contexts/UserContext";
import { StyleProvider } from "@/components/StyleProvider";
import { SecretThemeProvider } from "@/contexts/SecretThemeContext";
import { SoundProvider } from "@/contexts/SoundContext";
import SoundEffects from "@/components/SoundEffects";

export const metadata: Metadata = {
  title: "Pixel Place",
  description: "Pixel Place by Mainline Studios",
};

function getSchemaOrgJsonLd() {
  const baseUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BASE_URL) ||
    'https://pixelplaceofficial.com';
  const cleanUrl = baseUrl.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${cleanUrl}/#webapp`,
        name: 'Pixel Place',
        description:
          'Pixel Place is a web-based gaming platform and creative studio by Mainline Studios. Build games, play with friends, customize your avatar, and explore a community of creators. Features built-in games (Showdown, Tag, Snake, 3D runners), Game Studio, avatar customization, Pixel Coins, and AI-assisted coding.',
        url: cleanUrl,
        applicationCategory: 'Game',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Works in modern browsers.',
        author: {
          '@type': 'Organization',
          '@id': `${cleanUrl}/#organization`,
          name: 'Mainline Studios',
          url: cleanUrl,
        },
        publisher: { '@id': `${cleanUrl}/#organization` },
        image: `${cleanUrl}/logo.png`,
        featureList: [
          'Avatar customization with skins and accessories',
          'Built-in games: Showdown, Tag, Snake, 3D Avatar Runner, Memory, Tic-Tac-Toe, and more',
          'Game Studio to build and publish your own games',
          'Social features: friends, community creations, sharing',
          'Pixel Coins economy',
          'AI-powered coding assistance',
        ],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'Organization',
        '@id': `${cleanUrl}/#organization`,
        name: 'Mainline Studios',
        url: cleanUrl,
      },
    ],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchemaOrgJsonLd()) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('pixelplace_style');if(s&&/^(modern|futuristic|normal|90s|80s|lowcontrast)$/.test(s))document.documentElement.setAttribute('data-style',s);else document.documentElement.setAttribute('data-style','normal');})();`,
          }}
        />
        <link rel="icon" href="/logo.png" type="image/png" />
        <Script src="/pyx-client.js" strategy="beforeInteractive" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <StyleProvider>
          <SecretThemeProvider>
            <SoundProvider>
              <UserProvider>
              <SoundEffects />
              {children}
              </UserProvider>
            </SoundProvider>
          </SecretThemeProvider>
        </StyleProvider>
      </body>
    </html>
  );
}




