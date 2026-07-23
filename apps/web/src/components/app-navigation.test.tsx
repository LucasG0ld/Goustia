// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";

import { AppNavigation } from "./app-navigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/planning",
}));

describe("authenticated navigation", () => {
  it("marks the current page in desktop and mobile navigation", () => {
    render(<AppNavigation />);
    const current = screen.getAllByRole("link", { name: "Planning" });
    expect(current).toHaveLength(2);
    expect(
      current.every((link) => link.getAttribute("aria-current") === "page"),
    ).toBe(true);
  });

  it("has no detectable structural accessibility violation", async () => {
    const { container } = render(<AppNavigation />);
    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});
