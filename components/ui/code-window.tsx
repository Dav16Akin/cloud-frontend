"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeTab {
  label: string;
  language: string;
  code: string;
}

interface CodeWindowProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: CodeTab[];
  title?: string;
}

export function CodeWindow({
  tabs,
  title = "Terminal",
  className,
  ...props
}: CodeWindowProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentTab = tabs[activeTab] || tabs[0];

  const handleCopy = async () => {
    if (!currentTab) return;
    await navigator.clipboard.writeText(currentTab.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-slot="code-window"
      className={cn(
        "rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden font-mono text-xs sm:text-sm",
        className
      )}
      {...props}
    >
      {/* Window Titlebar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-600/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-600/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-600/50" />
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5" />
            {title}
          </span>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-1">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                activeTab === idx
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              {tab.label}
            </button>
          ))}

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy code"
            className="ml-2 p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="p-4 sm:p-5 overflow-x-auto leading-relaxed">
        <pre className="text-slate-300">
          <code>{currentTab?.code}</code>
        </pre>
      </div>
    </div>
  );
}

export default CodeWindow;
