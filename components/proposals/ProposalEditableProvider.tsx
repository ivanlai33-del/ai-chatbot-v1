"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ProposalEditableContextType {
  isAdminBypass: boolean;
  slug: string;
  textOverrides: Record<string, string>;
  isDirty: boolean;
  pendingCount: number;
  activeVersionId: string;
  updateText: (id: string, newText: string) => void;
  getText: (id: string, defaultText: string) => string;
  saveNewVersion: () => Promise<void>;
  resetChanges: () => void;
}

const ProposalEditableContext = createContext<ProposalEditableContextType>({
  isAdminBypass: false,
  slug: "",
  textOverrides: {},
  isDirty: false,
  pendingCount: 0,
  activeVersionId: "v1",
  updateText: () => {},
  getText: (id, defaultText) => defaultText,
  saveNewVersion: async () => {},
  resetChanges: () => {},
});

export function ProposalEditableProvider({
  slug,
  isAdminBypass = false,
  children,
}: {
  slug: string;
  isAdminBypass?: boolean;
  children: React.ReactNode;
}) {
  const [textOverrides, setTextOverrides] = useState<Record<string, string>>({});
  const [initialOverrides, setInitialOverrides] = useState<Record<string, string>>({});
  const [activeVersionId, setActiveVersionId] = useState<string>("v1");
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>("");

  // Fetch current active version or version from URL query (?v=v2)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const targetV = urlParams.get("v") || undefined;

    fetch(`/api/proposals/versions?slug=${slug}${targetV ? `&v=${targetV}` : ""}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.textOverrides) {
          setTextOverrides(data.textOverrides);
          setInitialOverrides(data.textOverrides);
          if (data.activeVersionId) {
            setActiveVersionId(data.currentVersion?.versionId || data.activeVersionId);
          }
        }
      })
      .catch((err) => console.warn("[Version Load Error]:", err));
  }, [slug]);

  const updateText = (id: string, newText: string) => {
    setTextOverrides((prev) => {
      const updated = { ...prev, [id]: newText };
      // Count changed fields compared to initialOverrides
      let diffs = 0;
      Object.keys(updated).forEach((key) => {
        if (updated[key] !== initialOverrides[key]) {
          diffs++;
        }
      });
      setIsDirty(diffs > 0);
      setPendingCount(diffs);
      return updated;
    });
  };

  const getText = (id: string, defaultText: string) => {
    if (textOverrides[id] !== undefined) {
      return textOverrides[id];
    }
    return defaultText;
  };

  const resetChanges = () => {
    setTextOverrides(initialOverrides);
    setIsDirty(false);
    setPendingCount(0);
  };

  const saveNewVersion = async () => {
    if (isSaving) return;

    const nextVerNum = parseInt(activeVersionId.replace("v", "") || "1", 10) + 1;
    const defaultNote = `版本 v${nextVerNum} (文案與數字自訂編修版)`;
    const notePrompt = prompt(
      `確定要儲存為全新版本 v${nextVerNum} 嗎？\n\n可輸入修改備註 (如：調整台灣口語文案與優惠價格)：`,
      defaultNote
    );

    if (notePrompt === null) return; // User cancelled

    setIsSaving(true);
    try {
      const res = await fetch("/api/proposals/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_VERSION",
          slug,
          textOverrides,
          note: notePrompt || defaultNote,
        }),
      });

      const data = await res.json();
      if (data.success && data.createdVersion) {
        const createdVer = data.createdVersion;
        setActiveVersionId(createdVer.versionId);
        setInitialOverrides(textOverrides);
        setIsDirty(false);
        setPendingCount(0);
        setSaveSuccessMsg(`✓ 成功發布新版本 ${createdVer.versionId}！`);
        setTimeout(() => setSaveSuccessMsg(""), 3500);
      } else {
        alert("儲存版本失敗: " + (data.error || "未知錯誤"));
      }
    } catch (err) {
      console.error(err);
      alert("連線儲存失敗，請檢視網路。");
    } finally {
      setIsSaving(false);
    }
  };

  const currentNum = parseInt(activeVersionId.replace("v", "") || "1", 10);
  const nextVerNum = currentNum + 1;

  return (
    <ProposalEditableContext.Provider
      value={{
        isAdminBypass,
        slug,
        textOverrides,
        isDirty,
        pendingCount,
        activeVersionId,
        updateText,
        getText,
        saveNewVersion,
        resetChanges,
      }}
    >
      {children}

      {/* Floating Save Bar (Only visible in Owner Bypass mode when changes detected) */}
      {isAdminBypass && isDirty && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900/95 text-white border-2 border-teal-500 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-bounce print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping"></span>
            <span>✏️ 偵測到修改 {pendingCount} 處文案/數字</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetChanges}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              ↩️ 撤銷修改
            </button>
            <button
              onClick={saveNewVersion}
              disabled={isSaving}
              className="px-4 py-1.5 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-black shadow-lg transition active:scale-95 cursor-pointer"
            >
              {isSaving ? "儲存中..." : `💾 儲存並發布為 v${nextVerNum} 版本`}
            </button>
          </div>
        </div>
      )}

      {/* Save Success Banner Notification */}
      {saveSuccessMsg && (
        <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-full shadow-2xl animate-fade-in border border-emerald-400 print:hidden">
          {saveSuccessMsg}
        </div>
      )}
    </ProposalEditableContext.Provider>
  );
}

export function useProposalEditable() {
  return useContext(ProposalEditableContext);
}

/**
 * ✎ 可動態點擊編輯之全頁文案元件
 */
export function EditableText({
  id,
  defaultText,
  className = "",
  tag: Tag = "span",
  multiline = false,
}: {
  id: string;
  defaultText: string;
  className?: string;
  tag?: any;
  multiline?: boolean;
}) {
  const { isAdminBypass, getText, updateText } = useProposalEditable();
  const currentText = getText(id, defaultText);

  if (!isAdminBypass) {
    return <Tag className={className}>{currentText}</Tag>;
  }

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const text = e.currentTarget.innerText || "";
    if (text !== currentText) {
      updateText(id, text);
    }
  };

  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={`${className} outline-none transition-all hover:outline-dashed hover:outline-2 hover:outline-teal-400 hover:bg-teal-50/20 rounded px-0.5 relative group focus:bg-teal-100/40 focus:outline-2 focus:outline-teal-600 cursor-text`}
      title="點擊即可直接修改文案與數字"
    >
      {currentText}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-teal-600 ml-1 select-none pointer-events-none font-sans font-normal">
        ✎
      </span>
    </Tag>
  );
}
