// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import Home from "@/app/page";

afterEach(cleanup);

test("offers a keyboard skip link to the main heading and identifies the demo", async () => {
  const user = userEvent.setup();
  render(<Home />);
  const heading = screen.getByRole("heading", { name: "Parenting can feel like a lot.", level: 1 });
  const skipLink = screen.getByRole("link", { name: "Skip to main content" });
  await user.tab();
  expect(skipLink).toHaveFocus();
  expect(skipLink).toHaveAttribute("href", `#${heading.id}`);
  expect(heading).toHaveAttribute("tabindex", "-1");
  expect(screen.getByRole("main")).toHaveAccessibleName(heading.textContent!);
  expect(screen.getByText(/Preview — no AI call/)).toBeVisible();
  expect(screen.getByRole("complementary", { name: "Emergency guidance" })).toBeVisible();
});
