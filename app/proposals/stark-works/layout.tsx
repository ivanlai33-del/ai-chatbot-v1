import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "史塔克運動科學團隊 — AI 運動顧問與雙通道智能店長系統提案",
  description: "專為史塔克運動科學團隊打造之 LINE 官方帳號與官網雙通道 AI 運動顧問、課程評估導客、產品推薦與線上預約系統提案書",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function StarkWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
