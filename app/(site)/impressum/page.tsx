import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";
import { cafe } from "@/lib/cafe";
import { getContactInfo } from "@/lib/content";

export const metadata: Metadata = { title: "Impressum" };

export default async function ImpressumPage() {
  const contact = await getContactInfo();
  return (
    <PageStub
      title="Impressum"
      notice="Entwurf, rechtlich noch nicht geprüft und nicht freigegeben. Die Angaben stammen von der bisherigen Website und werden vor Veröffentlichung mit dem Café abgestimmt."
    >
      <h2>Angaben zum Anbieter</h2>
      <address>
        {cafe.owner}
        <br />
        {cafe.name}
        <br />
        {contact.address.street}
        <br />
        {contact.address.postalCode} {contact.address.city}
      </address>
      <p>
        Telefon: <a href={contact.phone.href}>{contact.phone.display}</a>
      </p>
    </PageStub>
  );
}
