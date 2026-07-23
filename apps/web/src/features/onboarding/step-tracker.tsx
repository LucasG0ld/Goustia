"use client";

import { useEffect, useRef } from "react";

export function OnboardingStepTracker({
  step,
}: {
  step: "food_safety" | "goals" | "initial_tastes";
}) {
  const completed = useRef(false);

  useEffect(() => {
    void fetch("/api/v1/onboarding/events", {
      method: "POST",
      body: JSON.stringify({ step, event: "viewed" }),
    });
    const markCompleted = () => {
      completed.current = true;
    };
    const onPageHide = () => {
      if (!completed.current) {
        navigator.sendBeacon(
          "/api/v1/onboarding/events",
          JSON.stringify({ step, event: "abandoned" }),
        );
      }
    };
    window.addEventListener("goustia:onboarding-completed", markCompleted);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("goustia:onboarding-completed", markCompleted);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [step]);

  return null;
}

export function markOnboardingStepSubmitted() {
  window.dispatchEvent(new Event("goustia:onboarding-completed"));
}
