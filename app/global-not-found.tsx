import type { Metadata } from "next";
import NotFoundView from "@/components/NotFoundView";
import SiteFrame from "@/components/SiteFrame";
import { getT } from "@/lib/i18n";

// Unmatched URLs never enter app/[locale]/layout.tsx — the root layout is that
// dynamic segment — so this file is the whole document. The nk_lang cookie
// (German when it is missing) picks the copy. Next injects noindex itself.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    metadataBase: new URL("https://www.nokta-studio.de"),
    title: t("meta.site.title"),
    description: t("meta.site.desc"),
  };
}

export default function GlobalNotFound() {
  return (
    <SiteFrame>
      <NotFoundView />
    </SiteFrame>
  );
}
