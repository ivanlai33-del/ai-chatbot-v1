import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "【生乳/奶霜專賣店】AI 品牌店長基礎入門專案報價單",
  description: "專為無專職小編門市打造的 24 小時線上 AI 智慧總管 ✕ 基礎接單與老闆後台 AI 數據助手提案",
};

export default function StarterProposalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-[#F7F3ED] text-[#382D24] font-sans antialiased overflow-x-hidden">
      {children}
    </div>
  );
}
