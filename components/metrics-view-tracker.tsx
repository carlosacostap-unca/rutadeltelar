'use client';

import { useEffect } from "react";
import { useExpoMode } from "@/components/expo-mode-provider";

export type MetricsEntityType =
  | "estaciones"
  | "actores"
  | "productos"
  | "experiencias"
  | "imperdibles";

type MetricsViewTrackerProps = {
  entityType: MetricsEntityType;
  entityId?: string;
  entitySlug: string;
  entityTitle: string;
};

const sentViews = new Set<string>();

export function MetricsViewTracker({
  entityType,
  entityId,
  entitySlug,
  entityTitle,
}: MetricsViewTrackerProps) {
  const { expoOffline } = useExpoMode();

  useEffect(() => {
    if (!entityId || expoOffline) return;

    const key = `${entityType}:${entityId}:${window.location.pathname}`;
    if (sentViews.has(key)) return;
    sentViews.add(key);

    const body = JSON.stringify({
      entityType,
      entityId,
      entitySlug,
      entityTitle,
      path: window.location.pathname,
    });

    void fetch("/api/metrics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    })
      .catch(() => {
        sentViews.delete(key);
      })
      .finally(() => {
        window.setTimeout(() => sentViews.delete(key), 5000);
      });
  }, [entityId, entitySlug, entityTitle, entityType, expoOffline]);

  return null;
}
