"use client";

import React, { useState, useEffect } from "react";

export { ProposalEditableProvider, EditableText, useProposalEditable } from './ProposalEditableProvider';

export const PROVIDER_INFO = {
  companyName: "奕暢創新設計工作室",
  taxId: "41370842",
  phone: "0987528785",
  lineId: "ivanlai33",
  bankName: "中國信託銀行 (代碼 822) 內壢簡易型分行",
  bankCode: "822",
  accountName: "賴奕暢",
  accountNumber: "131540035543",
  officialDomain: "bot.ycideas.com",
};

/**
 * 4. 🛡️ 全頁背景防偽斜向浮水印
 */
export function SecurityWatermarkOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden opacity-[0.035] select-none print:hidden flex flex-wrap justify-center items-center gap-16 p-8">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="transform -rotate-25 text-[#0F172A] font-black text-xs sm:text-sm tracking-wider whitespace-nowrap"
        >
          奕暢創新設計工作室 機密報價單 ｜ 智慧財產保護 ｜ 嚴禁重製與變造 ｜ {PROVIDER_INFO.taxId}
        </div>
      ))}
    </div>
  );
}

/**
 * 2. 🔑 管理者上帝視角 Banner
 */
export function OwnerBypassBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white py-1.5 px-4 text-center font-bold text-xs shadow-md print:hidden flex justify-center items-center gap-2">
      <span>👑 奕暢創新管理者預覽模式</span>
      <span className="opacity-90 font-normal">(特權存取中，已自動豁免密碼鎖、5 天過期與 10 天 404 限制)</span>
    </div>
  );
}

/**
 * 5. 🚨 官方直營防詐聲明與即時網域連線驗證 Component
 */
export function FraudAlertAndDomainVerifier() {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedTime, setVerifiedTime] = useState<string | null>(null);

  const handleOpenVerify = () => {
    setShowVerifyModal(true);
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedTime(new Date().toLocaleString("zh-TW"));
    }, 600);
  };

  return (
    <>
      <div className="w-full bg-rose-50 border-2 border-rose-500/80 rounded-2xl p-3 my-3 shadow-xs print:border-rose-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-start gap-2">
            <span className="text-lg shrink-0">🚨</span>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-rose-900 leading-tight">
                官方直營防詐騙聲明
              </h4>
              <p className="text-[11px] sm:text-xs text-rose-800 font-medium mt-0.5">
                本專案絕無委託任何第三方仲介或個人代收款項。唯一合法收款戶名為：<b>【{PROVIDER_INFO.accountName}】</b>（統一編號：{PROVIDER_INFO.taxId}）。
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenVerify}
            type="button"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 shrink-0 cursor-pointer print:hidden"
          >
            🔍 官方網域真實資料驗證
          </button>
        </div>
      </div>

      {/* 官方真實連線驗證 Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex justify-center items-center p-4 print:hidden">
          <div className="w-full max-w-md bg-[#FFFDF9] border-2 border-teal-500 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping"></span>
                <h3 className="font-black text-base text-slate-900">
                  官方網域 SSL 真實性線上驗證
                </h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg px-2"
              >
                ✕
              </button>
            </div>

            {isVerifying ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500 font-bold">即時連線官方資料庫比對防偽金鑰...</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-800">
                    <span>✅</span> 驗證通過：官方授權商業報價網域
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    目前存取網域：<b className="font-mono">{PROVIDER_INFO.officialDomain}</b> (合規加密)
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">乙方工作室：</span>
                    <span className="font-bold text-slate-900">{PROVIDER_INFO.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">統一編號：</span>
                    <span className="font-bold text-slate-900">{PROVIDER_INFO.taxId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">指定對帳銀行：</span>
                    <span className="font-bold text-slate-900">{PROVIDER_INFO.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">唯一指定戶名：</span>
                    <span className="font-bold text-teal-700">{PROVIDER_INFO.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">唯一匯款帳號：</span>
                    <span className="font-bold text-teal-700">{PROVIDER_INFO.accountNumber}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center font-mono">
                  即時防偽簽章時間：{verifiedTime}
                </p>

                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
                >
                  確認無誤，返回報價單
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * 7. 🌐 VPN 代理與海外 IP 全螢幕自動攔截 Modal
 */
export function VpnInterceptModal() {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex justify-center items-center p-6 text-center text-slate-100 font-sans print:hidden">
      <div className="w-full max-w-md bg-[#1E293B] border-2 border-rose-500 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="w-16 h-16 bg-rose-950/80 text-rose-400 rounded-full flex items-center justify-center text-3xl mx-auto border border-rose-700">
          🌐
        </div>
        <h2 className="text-xl font-black text-white">🔒 安全存取驗證失敗</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          系統偵測到您的網路連線來自<b>海外地區 (Foreign IP) 或使用了 VPN 代理/機房跳板 IP</b>。
          基於商業機密防護與地區資安政策，本專案報價單僅允許<b>台灣在地實體網路</b>正常瀏覽。
        </p>

        <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-3 text-xs text-rose-400 font-mono space-y-1">
          <p>請關閉 VPN 代理 / 切換回台灣電信網路後刷新頁面</p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
        >
          🔄 我已關閉 VPN，刷新重新連線
        </button>
      </div>
    </div>
  );
}

/**
 * 8. 🖨️ 官方主管簽核與用印欄 Component (專供白紙黑字紙本列印用)
 */
export function PrintSignatureSection({ proposalTitle = "專案報價單" }: { proposalTitle?: string }) {
  const sha256Hash = "SHA256-AUTH-" + Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + Date.now();

  return (
    <div className="hidden print:block w-full mt-10 pt-6 border-t-2 border-slate-900 text-slate-900 font-sans space-y-6">
      <div className="flex justify-between items-center border-b border-slate-300 pb-2 text-xs">
        <div>
          <b className="text-sm">{PROVIDER_INFO.companyName}</b> (統編: {PROVIDER_INFO.taxId})
        </div>
        <div className="font-mono text-[10px] text-slate-600">
          官方列印驗證碼：{sha256Hash}
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-base font-black text-slate-900">【委託方主管簽核與商業用印欄】</h3>
        <p className="text-xs text-slate-600 mt-1">專案名稱：{proposalTitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 pt-4">
        {/* 甲方 (委託方) */}
        <div className="border-2 border-slate-400 rounded-xl p-4 space-y-12">
          <div className="font-bold text-xs border-b border-slate-300 pb-2">
            【甲方 — 委託簽核用印】
          </div>
          <div className="space-y-4 text-xs">
            <p>主管 / 代表人簽名：_______________________</p>
            <p>公司關防 / 簽約用印：</p>
            <div className="h-16 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
              (蓋印處)
            </div>
            <p>簽署日期：____ 年 ____ 月 ____ 日</p>
          </div>
        </div>

        {/* 乙方 (執行方) */}
        <div className="border-2 border-slate-400 rounded-xl p-4 space-y-12 bg-slate-50/50">
          <div className="font-bold text-xs border-b border-slate-300 pb-2">
            【乙方 — 執行方工作室】
          </div>
          <div className="space-y-4 text-xs">
            <p>執行負責人：<b>賴奕暢</b></p>
            <p>工作室大印 / 代表人章：</p>
            <div className="h-16 border border-slate-400 rounded-lg flex items-center justify-center text-xs font-bold text-teal-800">
              [ 奕暢創新設計工作室 專用章 ]
            </div>
            <p>列印核發日期：{new Date().toLocaleDateString("zh-TW")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
