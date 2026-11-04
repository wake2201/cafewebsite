/**
 * Workspace icon: the café's own logo (unaltered, on its paper ground so the black lettering stays
 * legible in the dark scheme). Sanity shows it next to the workspace title in the navbar and on
 * the login screen. Decorative there, because the title "Café am Lindenplatz" is shown beside it.
 */
export function StudioIcon() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#FFFCF8",
        borderRadius: 3,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny fixed asset inside the client-only Studio */}
      <img
        src="/images/brand/cafe-am-lindenplatz-logo.png"
        alt=""
        width={834}
        height={381}
        style={{ display: "block", width: "100%", height: "auto" }}
      />
    </span>
  );
}
