import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Freight Audit Dashboard",
  description: "Executive Audit Overview & Discrepancy Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
