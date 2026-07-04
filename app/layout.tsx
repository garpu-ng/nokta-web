import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BranchTheme from "@/components/BranchTheme";

export const metadata: Metadata = {
  title: "nokta — Studio für Design, Architekturvisualisierung & Liniendrucke",
  description:
    "nokta ist ein Studio mit drei Disziplinen: nokta (Layout, Design, Druck), nokta.arch (Architekturvisualisierung) und nokta.line (2D-, Vektor- und CAD-Kunstdrucke).",
  metadataBase: new URL("https://nokta.kaanmaan.cv"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        {/* mir.no layout CSS — used by the ported archviz (nokta.arch) pages */}
        <link rel="stylesheet" href="/mir.css" />
      </head>
      <body>
        <BranchTheme />
        <Header />
        {children}
      </body>
    </html>
  );
}
