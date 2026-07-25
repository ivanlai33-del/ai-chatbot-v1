import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "科隆工業 — 網站全站重置、全資產還原與現代化工程重構專案報價計畫書",
  description: "專為科隆工業打造之舊網站資產還原、現代化前端重構、動態後台重建與原主機無縫銜接部署實作報價單",
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
