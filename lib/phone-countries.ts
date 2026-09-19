/** Calling codes for the phone picker — Polish labels, PL first. */

export type PhoneCountry = {
  iso: string;
  dial: string;
  label: string;
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: "PL", dial: "48", label: "Polska" },
  { iso: "DE", dial: "49", label: "Niemcy" },
  { iso: "CZ", dial: "420", label: "Czechy" },
  { iso: "SK", dial: "421", label: "Słowacja" },
  { iso: "UA", dial: "380", label: "Ukraina" },
  { iso: "LT", dial: "370", label: "Litwa" },
  { iso: "LV", dial: "371", label: "Łotwa" },
  { iso: "EE", dial: "372", label: "Estonia" },
  { iso: "BY", dial: "375", label: "Białoruś" },
  { iso: "AT", dial: "43", label: "Austria" },
  { iso: "BE", dial: "32", label: "Belgia" },
  { iso: "BG", dial: "359", label: "Bułgaria" },
  { iso: "HR", dial: "385", label: "Chorwacja" },
  { iso: "CY", dial: "357", label: "Cypr" },
  { iso: "DK", dial: "45", label: "Dania" },
  { iso: "FI", dial: "358", label: "Finlandia" },
  { iso: "FR", dial: "33", label: "Francja" },
  { iso: "GR", dial: "30", label: "Grecja" },
  { iso: "ES", dial: "34", label: "Hiszpania" },
  { iso: "NL", dial: "31", label: "Holandia" },
  { iso: "IE", dial: "353", label: "Irlandia" },
  { iso: "IS", dial: "354", label: "Islandia" },
  { iso: "LU", dial: "352", label: "Luksemburg" },
  { iso: "MT", dial: "356", label: "Malta" },
  { iso: "MD", dial: "373", label: "Mołdawia" },
  { iso: "NO", dial: "47", label: "Norwegia" },
  { iso: "PT", dial: "351", label: "Portugalia" },
  { iso: "RO", dial: "40", label: "Rumunia" },
  { iso: "SI", dial: "386", label: "Słowenia" },
  { iso: "CH", dial: "41", label: "Szwajcaria" },
  { iso: "SE", dial: "46", label: "Szwecja" },
  { iso: "HU", dial: "36", label: "Węgry" },
  { iso: "GB", dial: "44", label: "Wielka Brytania" },
  { iso: "IT", dial: "39", label: "Włochy" },
  { iso: "AL", dial: "355", label: "Albania" },
  { iso: "AD", dial: "376", label: "Andora" },
  { iso: "BA", dial: "387", label: "Bośnia i Hercegowina" },
  { iso: "ME", dial: "382", label: "Czarnogóra" },
  { iso: "XK", dial: "383", label: "Kosowo" },
  { iso: "MK", dial: "389", label: "Macedonia Północna" },
  { iso: "MC", dial: "377", label: "Monako" },
  { iso: "RU", dial: "7", label: "Rosja" },
  { iso: "RS", dial: "381", label: "Serbia" },
  { iso: "TR", dial: "90", label: "Turcja" },
  { iso: "VA", dial: "379", label: "Watykan" },
  { iso: "US", dial: "1", label: "Stany Zjednoczone" },
  { iso: "CA", dial: "1", label: "Kanada" },
  { iso: "MX", dial: "52", label: "Meksyk" },
  { iso: "AR", dial: "54", label: "Argentyna" },
  { iso: "BR", dial: "55", label: "Brazylia" },
  { iso: "CL", dial: "56", label: "Chile" },
  { iso: "CO", dial: "57", label: "Kolumbia" },
  { iso: "PE", dial: "51", label: "Peru" },
  { iso: "UY", dial: "598", label: "Urugwaj" },
  { iso: "AU", dial: "61", label: "Australia" },
  { iso: "NZ", dial: "64", label: "Nowa Zelandia" },
  { iso: "JP", dial: "81", label: "Japonia" },
  { iso: "KR", dial: "82", label: "Korea Południowa" },
  { iso: "CN", dial: "86", label: "Chiny" },
  { iso: "HK", dial: "852", label: "Hongkong" },
  { iso: "TW", dial: "886", label: "Tajwan" },
  { iso: "SG", dial: "65", label: "Singapur" },
  { iso: "MY", dial: "60", label: "Malezja" },
  { iso: "TH", dial: "66", label: "Tajlandia" },
  { iso: "VN", dial: "84", label: "Wietnam" },
  { iso: "ID", dial: "62", label: "Indonezja" },
  { iso: "PH", dial: "63", label: "Filipiny" },
  { iso: "IN", dial: "91", label: "Indie" },
  { iso: "PK", dial: "92", label: "Pakistan" },
  { iso: "BD", dial: "880", label: "Bangladesz" },
  { iso: "AE", dial: "971", label: "Zjednoczone Emiraty Arabskie" },
  { iso: "SA", dial: "966", label: "Arabia Saudyjska" },
  { iso: "IL", dial: "972", label: "Izrael" },
  { iso: "QA", dial: "974", label: "Katar" },
  { iso: "KW", dial: "965", label: "Kuwejt" },
  { iso: "EG", dial: "20", label: "Egipt" },
  { iso: "MA", dial: "212", label: "Maroko" },
  { iso: "TN", dial: "216", label: "Tunezja" },
  { iso: "ZA", dial: "27", label: "Republika Południowej Afryki" },
  { iso: "NG", dial: "234", label: "Nigeria" },
  { iso: "KE", dial: "254", label: "Kenia" },
  { iso: "GE", dial: "995", label: "Gruzja" },
  { iso: "AM", dial: "374", label: "Armenia" },
  { iso: "AZ", dial: "994", label: "Azerbejdżan" },
  { iso: "KZ", dial: "7", label: "Kazachstan" },
  { iso: "UZ", dial: "998", label: "Uzbekistan" },
];

const PRIORITY_ISO = new Set(["PL", "DE", "CZ", "SK", "UA", "GB", "US", "FR", "IT", "ES", "NL"]);

/** PL + neighbours first, then A–Z by Polish label. */
export const PHONE_COUNTRIES_SORTED: PhoneCountry[] = (() => {
  const priority = PHONE_COUNTRIES.filter((c) => PRIORITY_ISO.has(c.iso));
  const rest = PHONE_COUNTRIES.filter((c) => !PRIORITY_ISO.has(c.iso)).sort((a, b) =>
    a.label.localeCompare(b.label, "pl"),
  );
  // Keep priority order as defined above
  const priorityOrdered = [...PRIORITY_ISO]
    .map((iso) => priority.find((c) => c.iso === iso))
    .filter((c): c is PhoneCountry => Boolean(c));
  return [...priorityOrdered, ...rest];
})();

export function findPhoneCountry(dial: string, iso?: string): PhoneCountry {
  if (iso) {
    const byIso = PHONE_COUNTRIES.find((c) => c.iso === iso);
    if (byIso) return byIso;
  }
  return PHONE_COUNTRIES.find((c) => c.dial === dial) ?? PHONE_COUNTRIES[0]!;
}

export function filterPhoneCountries(query: string): PhoneCountry[] {
  const q = query.trim().toLowerCase().replace(/^\+/, "");
  if (!q) return PHONE_COUNTRIES_SORTED;
  return PHONE_COUNTRIES_SORTED.filter((c) => {
    const hay = `${c.label} ${c.dial} +${c.dial} ${c.iso}`.toLowerCase();
    return hay.includes(q) || c.dial.startsWith(q) || c.label.toLowerCase().startsWith(q);
  });
}
