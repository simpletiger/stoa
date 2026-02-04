import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stoa - Shared Nervous System",
  description: "Task management dashboard for Jeremiah and Marcus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
