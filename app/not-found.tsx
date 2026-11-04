import Link from "next/link";
import { PageStub } from "@/components/PageStub";

export default function NotFound() {
  return (
    <PageStub title="Seite nicht gefunden" notice="Diese Adresse gibt es auf unserer Website nicht.">
      <p>
        <Link href="/">Zur Startseite</Link>
      </p>
    </PageStub>
  );
}
