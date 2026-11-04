import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";
import { WeeklyMenu } from "@/components/WeeklyMenu";

export const metadata: Metadata = {
  title: "Speisekarte",
  description: "Wochenkarte und Mittagstisch im Café am Lindenplatz, Zeitz.",
};

export default function SpeisekartePage() {
  return (
    <>
      <PageStub
        title="Speisekarte"
        notice="Diese Seite wird gerade neu gestaltet. Unten finden Sie die aktuelle Wochenkarte; weitere Angebote folgen hier in Kürze."
      />
      <WeeklyMenu />
    </>
  );
}
