import type { Metadata, Viewport } from "next";
import { Aboreto } from "next/font/google"; // Import the font directly
import "./globals.css";

// Configure Aboreto
const aboreto = Aboreto({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-aboreto",
});

export const viewport: Viewport = {
  themeColor: "#0c0c0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Sway Soul | Spin the Destiny",
  description: "Consult your soul for the perfect cocktail.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
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
      // Add the font variable to the class list
      className={`${aboreto.variable} h-full antialiased`}
    >
      <body className="h-full bg-[#0c0c0c]">{children}</body>
    </html>
  );
}