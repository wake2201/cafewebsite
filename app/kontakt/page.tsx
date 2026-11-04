import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";
import { cafe, openingHoursSummary } from "@/lib/cafe";

export const metadata: Metadata = {
  title: "Kontakt & Anfahrt",
  description: "Adresse, Telefon und Öffnungszeiten des Café am Lindenplatz in Zeitz.",
};

export default function KontaktPage() {
  return (
    <PageStub
      title="Kontakt & Anfahrt"
      notice="Diese Seite wird gerade neu gestaltet. Ein Kontaktformular folgt; bis dahin erreichen Sie uns am besten telefonisch."
    >
      <h2>Adresse</h2>
      <address>
        {cafe.name}
        <br />
        {cafe.address.street}
        <br />
        {cafe.address.postalCode} {cafe.address.city}
      </address>
      <p>
        <a href={cafe.directionsUrl} rel="noopener" target="_blank">
          Route in Google Maps öffnen<span className="visually-hidden"> (öffnet in neuem Tab)</span>
        </a>
      </p>
      <h2>Telefon</h2>
      <p>
        <a href={cafe.phone.href}>{cafe.phone.display}</a>
      </p>
      <h2>Öffnungszeiten</h2>
      <ul>
        {openingHoursSummary.map((row) => (
          <li key={row.days}>
            {row.days}: {row.hours}
          </li>
        ))}
      </ul>
    </PageStub>
  );
}
