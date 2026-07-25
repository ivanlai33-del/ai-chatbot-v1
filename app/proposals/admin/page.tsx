"use client";
import React, { useState, useEffect } from "react";
import { evaluateIpRisk } from "@/lib/services/ProposalAuditUtils";

interface ProjectSummary {
  slug: string;
  title: string;
  createdAt: string;
  lifecycle: {
    stage: "NORMAL" | "EXPIRED" | "ARCHIVED_404";
    countdownStarted: boolean;
    daysDiff: number;
    firstExternalViewedAt: string | null;
    message: string;
  };
  sessionCount: number;
  latestViewAt: string | null;
  latestIp: string | null;
  invoiceCount: number;
}

interface AuditSession {
  sessionId: string;
  proposalSlug: string;
  clientIp: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
  isTeamIp?: boolean;
  actions: { action: string; timestamp: string; details?: any }[];
  invoiceInfo?: {
    companyName: string;
    taxId: string;
    invoiceAddress?: string;
    contactEmail?: string;
    remittanceBank5?: string;
    remittanceName?: string;
    submittedAt: string;
  };
}

export default function ProposalAdminPage() {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [stats, setStats] = useState<{ totalProjects: number; totalSessions: number; totalInvoices: number; teamIpsCount?: number }>({
    totalProjects: 0,
    totalSessions: 0,
    totalInvoices: 0,
  });

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("stark-works");
  const [allLogs, setAllLogs] = useState<Record<string, AuditSession[]>>({});
  const [loading, setLoading] = useState(false);

  const ADMIN_PASSWORD = "87257257";

  useEffect(() => {
    const unlocked = sessionStorage.getItem("proposal_admin_unlocked");
    if (unlocked === "true") {
      setIsUnlocked(true);
      fetchDashboardData();
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      sessionStorage.setItem("proposal_admin_unlocked", "true");
      setErrorMsg("");
      fetchDashboardData();
    } else {
      setErrorMsg("密碼不正確");
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/proposals/audit-log?isAdmin=true");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setProjects(data.projects);
        setAllLogs(data.allLogs || {});
        if (data.projects.length > 0 && !selectedSlug) {
          setSelectedSlug(data.projects[0].slug);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSingleJSON = (slug: string) => {
    window.open(`/api/proposals/audit-log?export=single&slug=${slug}`, "_blank");
  };

  const handleExportAllJSON = () => {
    window.open("/api/proposals/audit-log?export=all", "_blank");
  };

  // 2. 🔑 極簡無字密碼鎖畫面 (無視覺文字提示，僅保留輸入框與按鈕)
  if (!isUnlocked) {
    return (
      <div className="w-full min-h-screen bg-[#0F172A] flex justify-center items-center p-4">
        <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#1E293B] border border-[#334155] rounded-xl text-center text-lg text-white focus:outline-none focus:border-teal-500 placeholder-slate-600 font-mono"
            autoFocus
          />
          {errorMsg && <p className="text-xs text-rose-500 text-center font-bold">{errorMsg}</p>}
          <button
            type="submit"
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition text-sm cursor-pointer active:scale-95"
          >
            解鎖
          </button>
        </form>
      </div>
    );
  }

  const selectedProject = projects.find((p) => p.slug === selectedSlug);
  const selectedSessions = (allLogs[selectedSlug] || []) as AuditSession[];

  return (
    <div className="w-full min-h-screen bg-[#0F172A] text-slate-200 font-sans">
      {/* Top Header & Stats Cards Bar */}
      <header className="bg-[#1E293B] border-b border-[#334155] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse"></span>
            <h1 className="text-lg font-black text-white">
              AI 店長報價單 — 總管理與對帳風險稽核後台
            </h1>
          </div>

          {/* Top Realtime Stats Bar */}
          <div className="flex items-center gap-4 text-xs">
            <div className="bg-[#0F172A] border border-[#334155] px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 block text-[10px]">總建置專案</span>
              <span className="font-mono font-black text-teal-400 text-sm">{stats.totalProjects} 個</span>
            </div>
            <div className="bg-[#0F172A] border border-[#334155] px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 block text-[10px]">跨裝置總觀看 Session</span>
              <span className="font-mono font-black text-cyan-400 text-sm">{stats.totalSessions} 次</span>
            </div>
            <div className="bg-[#0F172A] border border-[#334155] px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 block text-[10px]">發票與對帳綁定紀錄</span>
              <span className="font-mono font-black text-emerald-400 text-sm">{stats.totalInvoices} 筆</span>
            </div>

            <button
              onClick={handleExportAllJSON}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-md transition text-xs cursor-pointer active:scale-95"
            >
              📥 匯出全站備份 JSON
            </button>
          </div>
        </div>
      </header>

      {/* Main 2-Column Dashboard Layout */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Client Projects List */}
        <div className="md:col-span-4 bg-[#1E293B] border border-[#334155] rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-[#334155]">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>📋</span> 全客戶專案動態列表
            </h2>
            <button onClick={fetchDashboardData} className="text-xs text-teal-400 underline">
              {loading ? "更新中..." : "🔄 整理"}
            </button>
          </div>

          <div className="space-y-2">
            {projects.map((p) => {
              const isSelected = p.slug === selectedSlug;
              const { stage, countdownStarted, daysDiff } = p.lifecycle;

              return (
                <div
                  key={p.slug}
                  onClick={() => setSelectedSlug(p.slug)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? "bg-teal-950/40 border-teal-500 shadow-md"
                      : "bg-[#0F172A]/70 border-[#334155] hover:border-slate-500"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-white">{p.title}</h3>
                    {stage === "NORMAL" && !countdownStarted && (
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold border border-slate-600">
                        🟢 尚未開啟 (計時未始)
                      </span>
                    )}
                    {stage === "NORMAL" && countdownStarted && (
                      <span className="text-[10px] bg-blue-900/80 text-blue-300 px-2 py-0.5 rounded-full font-bold border border-blue-700 animate-pulse">
                        🔵 Day {daysDiff} 倒數中 (已啟動)
                      </span>
                    )}
                    {stage === "EXPIRED" && (
                      <span className="text-[10px] bg-amber-900/80 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-700 animate-pulse">
                        🟡 Day {daysDiff} 密碼過期
                      </span>
                    )}
                    {stage === "ARCHIVED_404" && (
                      <span className="text-[10px] bg-rose-900/80 text-rose-300 px-2 py-0.5 rounded-full font-bold border border-rose-700">
                        🔴 Day {daysDiff} 404歸檔
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-teal-400 font-mono mt-1">
                    {p.lifecycle.message}
                  </p>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono mt-2 pt-2 border-t border-[#334155]/50">
                    <span>傳閱 Session: <b className="text-white">{p.sessionCount}</b></span>
                    <span>最新觀看: {p.latestViewAt ? new Date(p.latestViewAt).toLocaleDateString('zh-TW') : '尚無觀看'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep-Dive Customer Logs & Audit Trail */}
        <div className="md:col-span-8 bg-[#1E293B] border border-[#334155] rounded-2xl p-5 space-y-5">
          {selectedProject ? (
            <>
              {/* Project Header */}
              <div className="flex flex-wrap justify-between items-center pb-3 border-b border-[#334155] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-white">{selectedProject.title}</h2>
                    <span className="text-xs font-mono text-slate-400">(/proposals/{selectedProject.slug})</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    創立時間: <b className="font-mono text-teal-400">{selectedProject.createdAt}</b> ｜ 客戶首次開啟:{" "}
                    <b className="font-mono text-yellow-400">
                      {selectedProject.lifecycle.firstExternalViewedAt
                        ? new Date(selectedProject.lifecycle.firstExternalViewedAt).toLocaleString("zh-TW")
                        : "尚無陌生 IP 開啟 (倒數未觸發)"}
                    </b>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* 上帝視角預閱連結 (帶 ?admin=87257257 免密且全豁免) */}
                  <a
                    href={`/proposals/${selectedProject.slug}?admin=87257257`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg text-xs font-bold shadow-sm hover:from-amber-500 hover:to-yellow-500 transition"
                  >
                    👑 上帝視角預閱 ➔
                  </a>
                  <button
                    onClick={() => handleExportSingleJSON(selectedProject.slug)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    📥 匯出此專案 JSON
                  </button>
                </div>
              </div>

              {/* 6. 🔒 預約匯出帳號對帳綁定資訊 Card */}
              <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-4 space-y-2">
                <h3 className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                  <span>🧾</span> 客戶基本、發票與銀行對帳綁定資料
                </h3>

                {selectedSessions.filter((s) => s.invoiceInfo).length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">該客戶尚未於專案頁面提交發票與對帳綁定資料</p>
                ) : (
                  selectedSessions
                    .filter((s) => s.invoiceInfo)
                    .map((s, idx) => (
                      <div key={idx} className="bg-[#1E293B] p-3.5 rounded-lg border border-teal-500/40 space-y-1.5 text-xs">
                        <div className="flex justify-between font-bold text-white">
                          <span>🏢 公司全銜：{s.invoiceInfo?.companyName}</span>
                          <span className="font-mono text-teal-400">統編：{s.invoiceInfo?.taxId}</span>
                        </div>

                        {/* 銀行對帳綁定資訊 */}
                        <div className="bg-[#0F172A] p-2.5 rounded-md border border-amber-500/40 text-amber-300 font-mono flex flex-wrap justify-between gap-2">
                          <span>💳 預計匯出帳號後 5 碼：<b>{s.invoiceInfo?.remittanceBank5 || "未填寫"}</b></span>
                          <span>👤 預計匯款戶名：<b>{s.invoiceInfo?.remittanceName || "未填寫"}</b></span>
                        </div>

                        <div className="text-slate-300">
                          📍 寄送地址：{s.invoiceInfo?.invoiceAddress || "未填寫"}
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px] font-mono pt-1">
                          <span>✉️ 通知 Email：{s.invoiceInfo?.contactEmail || "未填寫"}</span>
                          <span>⏰ 提交時間：{new Date(s.invoiceInfo?.submittedAt || "").toLocaleString("zh-TW")}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* 9. 📊 多成員傳閱、IP 智慧風險標記時間軸 */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <span>🕵️‍♂️</span> 多成員傳閱、IP 風險標記與點擊軌跡時間軸 ({selectedSessions.length} 筆觀看紀錄)
                </h3>

                <div className="bg-[#0F172A] border border-[#334155] rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#1E293B] text-slate-400 font-bold border-b border-[#334155]">
                      <tr>
                        <th className="p-2.5">觀看時間</th>
                        <th className="p-2.5">真實 IP 位址</th>
                        <th className="p-2.5">IP 風險評估</th>
                        <th className="p-2.5">裝置類型 (User-Agent)</th>
                        <th className="p-2.5">操作點擊軌跡</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155] text-slate-300">
                      {selectedSessions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-500 font-sans">
                            尚無傳閱觀看紀錄
                          </td>
                        </tr>
                      ) : (
                        selectedSessions.map((s, idx) => {
                          const ipRisk = evaluateIpRisk(s.clientIp, s.userAgent, s.isTeamIp);
                          return (
                            <tr key={idx} className="hover:bg-[#1E293B]/50 transition">
                              <td className="p-2.5 text-teal-300">
                                {new Date(s.updatedAt || s.createdAt).toLocaleString("zh-TW")}
                              </td>
                              <td className="p-2.5 font-bold text-white">{s.clientIp}</td>
                              <td className="p-2.5">
                                {ipRisk.level === "TEAM" && (
                                  <span className="bg-blue-900/60 text-blue-300 border border-blue-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                    {ipRisk.label}
                                  </span>
                                )}
                                {ipRisk.level === "LOCAL_TW" && (
                                  <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                    {ipRisk.label}
                                  </span>
                                )}
                                {ipRisk.level === "HIGH_RISK_VPN" && (
                                  <span className="bg-rose-900/80 text-rose-300 border border-rose-600 px-2 py-0.5 rounded-md text-[10px] font-bold animate-pulse">
                                    {ipRisk.label}
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-slate-400 max-w-[180px] truncate" title={s.userAgent}>
                                {s.userAgent}
                              </td>
                              <td className="p-2.5 text-emerald-400">
                                {s.actions && s.actions.length > 0
                                  ? s.actions.map((a) => a.action).join(" ➔ ")
                                  : "解鎖觀看頁面"}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-slate-500 py-12">請於左側選擇欲查閱之專案</p>
          )}
        </div>
      </div>
    </div>
  );
}
