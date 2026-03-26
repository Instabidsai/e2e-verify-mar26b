import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your AI Company — Powered by JarvisSDK",
  description: "AI-powered business built and operated by JarvisSDK agents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
