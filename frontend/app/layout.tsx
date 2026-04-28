import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { Inter } from "next/font/google";
import { UserProvider } from "@/contexts/UserContext";
import { I18nProvider } from "@/contexts/I18nProvider";
import { StyleProvider } from "@/components/StyleProvider";
import { SoundProvider } from "@/contexts/SoundContext";
import SoundEffects from "@/components/SoundEffects";
import { AppProviders } from "@/components/providers/AppProviders";
import CookieConsentBanner from "@/components/CookieConsentBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pixel Place",
  description: "Pixel Place by Mainline Studios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('pixelplace_style');if(s&&/^(modern|futuristic|normal|90s|80s|lowcontrast)$/.test(s))document.documentElement.setAttribute('data-style',s);else document.documentElement.setAttribute('data-style','normal');})();`,
          }}
        />
        <link rel="icon" href="/logo.png" type="image/png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen">
        <StyleProvider>
          <SoundProvider>
            <UserProvider>
              <I18nProvider>
                <AppProviders>
                  <SoundEffects />
                  {children}
                  <CookieConsentBanner />
                </AppProviders>
              </I18nProvider>
            </UserProvider>
          </SoundProvider>
        </StyleProvider>
      </body>
    </html>
  );
}




