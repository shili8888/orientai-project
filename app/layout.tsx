import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "东方命格 AI",
  description: "八字排盘、农历换算与个人命理报告工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
