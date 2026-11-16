import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

type Props = { lang: Locale; dict: Dictionary };

export function SiteFooter({ lang, dict }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="page-container section-y flex flex-col gap-8 md:flex-row md:justify-between">
        <div className="flex max-w-sm flex-col gap-3">
          <Logo />
          <p className="text-muted-foreground">{dict.meta.tagline}</p>
          <p className="text-sm text-muted-foreground">{dict.footer.location}</p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-display text-lg">{dict.footer.follow}</p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 font-bold text-primary underline-offset-4 hover:underline"
          >
            Instagram {INSTAGRAM_HANDLE}
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="page-container flex flex-col gap-3 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {dict.meta.siteName}. {dict.footer.rights}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            <li>
              <Link href={href(lang, "/privacidad")} className="hover:underline">
                {dict.footer.privacy}
              </Link>
            </li>
            <li>
              <Link href={href(lang, "/terminos")} className="hover:underline">
                {dict.footer.terms}
              </Link>
            </li>
            <li>
              <Link href={href(lang, "/cookies")} className="hover:underline">
                {dict.footer.cookies}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
