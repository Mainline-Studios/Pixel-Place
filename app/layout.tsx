import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { MobileBetaProvider } from "@/contexts/MobileBetaContext";
import { UserProvider } from "@/contexts/UserContext";
import { SiteLanguageProvider } from "@/contexts/SiteLanguageContext";
import { StyleProvider } from "@/components/StyleProvider";
import { ColorModeProvider } from "@/components/ColorModeProvider";
import { SecretThemeProvider } from "@/contexts/SecretThemeContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import SoundEffects from "@/components/SoundEffects";
import { getSchemaOrgJsonLd } from "@/lib/schemaOrg";

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
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchemaOrgJsonLd()) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var m=localStorage.getItem('pixelplace_color_mode');document.documentElement.setAttribute('data-color-mode',m==='light'?'light':'dark');var s=localStorage.getItem('pixelplace_style');if(s&&/^(modern|futuristic|normal|90s|80s|lowcontrast|highcontrast|maximalist|minimalist)$/.test(s))document.documentElement.setAttribute('data-style',s);else document.documentElement.setAttribute('data-style','normal');})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/logo.png" type="image/png" />
        <Script src="/pyx-client.js" strategy="beforeInteractive" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <ColorModeProvider>
        <StyleProvider>
          <AccessibilityProvider>
            <SecretThemeProvider>
              <SoundProvider>
                <MobileBetaProvider>
                  <UserProvider>
                    <SiteLanguageProvider>
                      <SoundEffects />
                      {children}
                    </SiteLanguageProvider>
                  </UserProvider>
                </MobileBetaProvider>
              </SoundProvider>
            </SecretThemeProvider>
          </AccessibilityProvider>
        </StyleProvider>
        </ColorModeProvider>
      </body>
    </html>
  );
}




