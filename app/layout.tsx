import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MaskPlay",
  description: "업무용 UI 스킨의 웹 미니게임 (MVP: 오목)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-dvh overflow-hidden">
      <body className="box-border flex h-dvh flex-col overflow-hidden bg-[#bdc1c6] font-sans text-gray-900 antialiased">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
