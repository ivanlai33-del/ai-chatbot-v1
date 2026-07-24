import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "華鍵汽車 — AI 社群全自動文案與多平台矩陣小編系統提案書",
  description: "專為華鍵汽車打造之 AI 智能社群文案生成、FB / IG / Threads 一鍵多平台發布與自動回覆留言私訊系統",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function HuajianMotorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
