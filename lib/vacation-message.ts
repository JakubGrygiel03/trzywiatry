import type { StudioSettings } from "@/lib/types";

/** Compact PL date for banner (avoids UTC shift on YYYY-MM-DD). */
export function formatBannerDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
}

const DEFAULT_QUIP = "Piec musiał ochłonąć";

/**
 * Builds the top-of-site vacation strip copy from admin dates + optional joke.
 * announcementText in vacation mode = custom quip (fallback: kiln joke).
 */
export function buildVacationBannerMessage(settings: StudioSettings) {
  const quip = (settings.announcementText?.trim() || DEFAULT_QUIP).replace(/\.$/, "");
  const start = settings.vacationStartDate ? formatBannerDate(settings.vacationStartDate) : null;
  const end = settings.vacationEndDate ? formatBannerDate(settings.vacationEndDate) : null;
  const dispatch = settings.vacationDispatchDate
    ? formatBannerDate(settings.vacationDispatchDate)
    : null;

  const range =
    start && end ? `od ${start} do ${end}` : end ? `do ${end}` : start ? `od ${start}` : null;

  const parts = [`${quip}.`];
  if (range) parts.push(`Pracownia na urlopie ${range}.`);
  if (dispatch) {
    parts.push(`Zamówienia złożone teraz wyślemy od ${dispatch}.`);
  } else {
    parts.push("Zamówienia realizujemy po powrocie.");
  }

  return parts.join(" ");
}

export function getVacationCheckoutNote(settings: StudioSettings) {
  if (settings.announcementType !== "vacation") return null;
  return buildVacationBannerMessage(settings);
}
