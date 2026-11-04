import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";
import { cafe } from "@/lib/cafe";

export const metadata: Metadata = { title: "Über uns" };

export default function UeberUnsPage() {
  return (
    <PageStub title="Über uns" notice="Diese Seite wird gerade neu gestaltet und folgt in Kürze.">
      <p>
        Das {cafe.name} in der {cafe.address.street} in {cafe.address.city} wird von {cafe.owner} geführt.
      </p>
    </PageStub>
  );
}
