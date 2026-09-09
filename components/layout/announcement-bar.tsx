import Link from "next/link";
import { connection } from "next/server";
import { getSettings } from "@/lib/data/queries";
import { buildVacationBannerMessage } from "@/lib/vacation-message";

export async function AnnouncementBar() {
  // Always read live admin settings (vacation toggle must not be baked at build).
  await connection();
  const settings = getSettings();

  if (settings.announcementType === "hidden") return null;

  const isVacation = settings.announcementType === "vacation";
  const message = isVacation ? buildVacationBannerMessage(settings) : settings.announcementText;

  return (
    <div
      className={`px-4 py-1.5 text-center ${isVacation ? "bg-czerwony" : "bg-czarny"}`}
      role="status"
    >
      <p className="mx-auto max-w-5xl font-heading text-[10px] uppercase leading-snug tracking-[0.08em] text-bialy/95 md:tracking-[0.16em]">
        {message}
        {settings.promoCode && settings.announcementType === "promo" ? (
          <>
            {" "}
            · kod{" "}
            <Link href="/sklep" className="text-ceglany underline decoration-ceglany/50 underline-offset-4">
              {settings.promoCode}
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
