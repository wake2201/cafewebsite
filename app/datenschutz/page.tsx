import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";

export const metadata: Metadata = { title: "Datenschutz" };

export default function DatenschutzPage() {
  return (
    <PageStub
      title="Datenschutz"
      notice="In Vorbereitung – die Datenschutzerklärung für die neue Website wird vor der Veröffentlichung erstellt und rechtlich geprüft."
    />
  );
}
