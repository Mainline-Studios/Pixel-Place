import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { UserProvider } from "@/contexts/UserContext";
<<<<<<< HEAD
import StyleProvider from "@/components/StyleProvider";
=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

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
      <body>
<<<<<<< HEAD
        <StyleProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </StyleProvider>
=======
        <UserProvider>
          {children}
        </UserProvider>
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
      </body>
    </html>
  );
}




