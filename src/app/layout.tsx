import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#EDE5D3",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ojamine.studio"),
  title: "Ojamine — Websites that make people stop scrolling.",
  description:
    "Ojamine builds websites and personal portfolios for people who'd rather be remembered than templated.",
  keywords: [
    "Ojamine",
    "web design studio",
    "personal portfolio studio",
    "3D websites",
    "custom websites",
    "interactive web studio",
  ],
  authors: [{ name: "Ojamine Studio" }],
  openGraph: {
    title: "Ojamine — Websites that make people stop scrolling.",
    description:
      "Ojamine builds websites and portfolios for people who'd rather be remembered than templated.",
    type: "website",
    siteName: "Ojamine",
    locale: "en_US",
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ojamine — Websites that make people stop scrolling.",
    description:
      "Ojamine builds websites and portfolios for people who'd rather be remembered than templated.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans antialiased bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}

