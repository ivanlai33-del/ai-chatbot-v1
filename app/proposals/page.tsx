"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ProposalsIndexPage() {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const VALID_PASSWORDS = ["20260723", "0723"];

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_PASSWORDS.includes(password.trim())) {
      setIsUnlocked(true);
      setErrorMsg("");
    } else {
      setErrorMsg("密碼不正確，請輸入本日日期（如: 20260723）");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3ED] text-[#382D24] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-[#FFFDF9] border border-[#E6DDCF] rounded-3xl p-8 shadow-xl backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#EFE7DA] text-[#B26A27] rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-[#D6A86E]">
            📁
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#382D24]">
            bot.ycideas.com 報價資料專區
          </h1>
          <p className="text-sm text-[#7C6E62] mt-1">
            本區包含專屬客戶之 AI 店長服務建置與代營運服務提案計畫書
          </p>
        </div>

        {!isUnlocked ? (
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="請輸入本日瀏覽密碼 (如: 20260723)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F7F3ED] border border-[#E6DDCF] rounded-xl text-center text-lg focus:outline-none focus:border-[#B26A27] text-[#382D24] placeholder-[#A39587]"
                autoFocus
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 text-center font-medium">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#B26A27] hover:bg-[#8F521B] text-[#FFFDF9] font-bold rounded-xl shadow-md transition"
            >
              進入報價資料區
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-[#EFE7DA] border border-[#D6A86E] rounded-2xl flex justify-between items-center">
              <div>
                <h3 className="font-bold font-serif text-[#B26A27]">
                  🍞 【奶油吐司】AI 店長全包建置提案
                </h3>
                <p className="text-xs text-[#7C6E62] mt-0.5">
                  5,000人會員規模 / 現金面交算錢 / 全代營運專案
                </p>
              </div>
              <Link
                href="/proposals/butter-toast"
                className="px-4 py-2 bg-[#B26A27] text-[#FFFDF9] text-xs font-bold rounded-xl hover:bg-[#8F521B] transition shadow"
              >
                檢視提案 ➔
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-[#E6DDCF] text-center text-xs text-[#A39587]">
          © 2026 bot.ycideas.com ｜ AI 店長專案服務團隊
        </div>
      </div>
    </div>
  );
}
