"use client";

import { useReportWebVitals } from "next/web-vitals";

const SUPPORTED_METRICS = new Set(["CLS", "FCP", "INP", "LCP", "TTFB"]);

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!SUPPORTED_METRICS.has(metric.name)) {
      return;
    }

    void fetch("/api/v1/metrics/web-vitals", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        navigationType: metric.navigationType,
      }),
      keepalive: true,
    });
  });

  return null;
}
