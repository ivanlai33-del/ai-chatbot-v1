import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "科隆工業 — 網站重置、砍站爬取與 AI 現代化重構專案報價計畫書",
  description: "專為科隆工業打造之舊網站靜態資源爬取、AI 代碼優化重構、動態後台重建與部署驗收實作報價單",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function KoloongProposalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
