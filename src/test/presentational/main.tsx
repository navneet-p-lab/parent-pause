import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { LocalizedShell } from "@/components/localized-shell";
import { Conversation } from "@/components/conversation";
import type { Locale, Turn } from "@/lib/contracts";
import { en } from "@/lib/i18n/en";
import { ur } from "@/lib/i18n/ur";
import { responseFixtures } from "@/test/fixtures/contracts";

const turns: Turn[] = (["en", "ur"] as const).flatMap((locale) =>
  Object.values(responseFixtures[locale]).flatMap((response): Turn[] => [
    { role: "user", text: "میرا 7 سال کا بچہ bedtime پر پریشان ہے، وقت 8:30 ہے۔ " + "لمبی عبارت ".repeat(12) },
    { role: "assistant", response },
  ]),
);

function PresentationHarness() {
  const [locale, setLocale] = useState<Locale>("en");
  return (
    <LocalizedShell locale={locale} onLocaleChange={setLocale}>
      <h1>{locale === "en" ? "Response presentation checks" : "جوابات کی نمائش"}</h1>
      <Conversation turns={turns} uiLocale={locale} labels={{ en: en.response, ur: ur.response }}
        status={{ kind: "idle" }} announcement={null} />
    </LocalizedShell>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><PresentationHarness /></StrictMode>);
