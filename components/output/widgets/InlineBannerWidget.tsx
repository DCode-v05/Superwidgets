"use client";

import { CheckCircle2, AlertTriangle, AlertOctagon, Info } from "lucide-react";
import type { InlineBannerPayload, BannerTone, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips } from "./shared";

/**
 * Inline banner — short status / outcome notice with one of 4 tones.
 * The tone determines: icon, left border color, and tinted background.
 */

const TONE: Record<
  BannerTone,
  {
    Icon: typeof CheckCircle2;
    border: string;
    bg: string;
    iconColor: string;
    titleColor: string;
    bodyColor: string;
  }
> = {
  success: {
    Icon: CheckCircle2,
    border: "border-l-green-500",
    bg: "bg-green-500/[0.07]",
    iconColor: "text-green-600 dark:text-green-400",
    titleColor: "text-green-800 dark:text-green-300",
    bodyColor: "text-green-700/85 dark:text-green-300/80",
  },
  warn: {
    Icon: AlertTriangle,
    border: "border-l-amber-500",
    bg: "bg-amber-500/[0.07]",
    iconColor: "text-amber-600 dark:text-amber-400",
    titleColor: "text-amber-800 dark:text-amber-300",
    bodyColor: "text-amber-700/85 dark:text-amber-300/80",
  },
  error: {
    Icon: AlertOctagon,
    border: "border-l-red-500",
    bg: "bg-red-500/[0.07]",
    iconColor: "text-red-600 dark:text-red-400",
    titleColor: "text-red-800 dark:text-red-300",
    bodyColor: "text-red-700/85 dark:text-red-300/80",
  },
  info: {
    Icon: Info,
    border: "border-l-blue-500",
    bg: "bg-blue-500/[0.07]",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-800 dark:text-blue-300",
    bodyColor: "text-blue-700/85 dark:text-blue-300/80",
  },
};

export function InlineBannerWidget({
  payload,
  actions,
}: {
  payload: InlineBannerPayload;
  actions?: WidgetAction[];
}) {
  const tone: BannerTone = payload?.tone ?? "info";
  const t = TONE[tone];
  const Icon = t.Icon;

  return (
    <div className={`rounded-lg border-l-4 ${t.border} ${t.bg} px-4 py-3`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${t.iconColor}`} strokeWidth={1.75} />
        <div className="flex-1 min-w-0">
          <div className={`text-[13px] font-semibold leading-snug ${t.titleColor}`}>
            {payload?.title ?? "Notice"}
          </div>
          {payload?.body && (
            <div className={`mt-0.5 text-[12px] leading-relaxed ${t.bodyColor}`}>
              {payload.body}
            </div>
          )}
        </div>
      </div>
      {actions && actions.length > 0 && <ActionChips actions={actions} />}
    </div>
  );
}
