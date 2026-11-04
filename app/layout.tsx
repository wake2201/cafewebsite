import type { Metadata } from "next";
import { dmSans, newsreader } from "./fonts";

/*
 * Root layout: document shell only. The public site's header, footer and global CSS live in
 * app/(site)/layout.tsx; the CMS at /admin (app/(studio)) gets none of them, so site styles
 * never leak into Sanity Studio and the Studio bundle never loads on public pages.
 */
export const metadata: Metadata = {
  // Pre-launch: keep everything out of search indexes until go-live is approved (Milestone 7).
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${newsreader.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
