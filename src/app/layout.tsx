import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/tokens.css";

export const metadata: Metadata = {
  title: "ParentPause",
  description: "A little space for your next parenting step.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" dir="ltr"><body style={{ margin: 0 }}>{children}</body></html>;
}
