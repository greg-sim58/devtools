import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "DevTools — fast, client-side developer utilities",
  description:
    "A collection of fast, private, client-side developer tools: JSON & SQL formatters, Base64, JWT, regex, UUID, timestamps and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
