"use client";

import type { ReactNode } from "react";

interface CmdFrameProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function CmdFrame({ title, subtitle, children, footer }: CmdFrameProps) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden border border-zinc-700 bg-black text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-3 py-2 text-xs">
        <span className="font-semibold text-zinc-100">{title}</span>
        <span className="text-zinc-400">{subtitle ?? "MASKPLAY_TERMINAL"}</span>
      </div>
      <div className="min-h-0 flex flex-1 flex-col overflow-hidden px-3 py-2 font-mono text-sm leading-6">{children}</div>
      {footer ? (
        <div className="border-t border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
