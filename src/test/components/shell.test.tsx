// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import Home from "@/app/page";

afterEach(cleanup);

test("offers a keyboard skip link to main content and identifies the assessment", async () => {
  const user = userEvent.setup();
  render(<Home />);
  expect(screen.getByRole("heading", { name: "Parenting can feel like a lot.", level: 1 })).toBeVisible();
  const skipLink = screen.getByRole("link", { name: "Skip to main content" });
  await user.tab();
  expect(skipLink).toHaveFocus();
  expect(skipLink).toHaveAttribute("href", `#${screen.getByRole("main").id}`);
  expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
  expect(screen.getByRole("main")).toHaveAccessibleName("Parenting support");
  expect(screen.getByText(/Assessment demo/)).toBeVisible();
  expect(screen.getByRole("complementary", { name: "Emergency guidance" })).toBeVisible();
});
