import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "WaArchi Studio — Architekturvisualisierung NRW",
  description:
    "Fotorealistische Architekturvisualisierungen aus NRW. Wir erstellen hochwertige 3D-Renderings für Architekten, Bauträger und Privatpersonen.",
  metadataBase: new URL("https://waarchi.de"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        {/* mir.no layout CSS — loaded from public folder */}
        <link rel="stylesheet" href="/mir.css" />
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
