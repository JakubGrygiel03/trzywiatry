/** Quiet card frames — category shows in the border, not in a pill silhouette. */
export function categoryFrame(category: string): { card: string; photo: string } {
  switch (category) {
    case "czarki":
      return {
        card: "rounded-xl border border-szary",
        photo: "rounded-lg",
      };
    case "kubki":
      return {
        card: "rounded-xl border border-czerwony/40",
        photo: "rounded-lg",
      };
    case "miski":
      return {
        card: "rounded-xl border border-szary",
        photo: "rounded-lg",
      };
    case "talerze":
      return {
        card: "rounded-xl border border-szary",
        photo: "rounded-lg",
      };
    case "czajniczki":
      return {
        card: "rounded-xl border border-ceglany/50",
        photo: "rounded-lg",
      };
    case "narzedzia":
    case "formy_matki":
    case "formy_master":
      return {
        card: "rounded-lg border border-dashed border-szary",
        photo: "rounded-md",
      };
    case "rzezby":
      return {
        card: "rounded-xl border border-ceglany/55",
        photo: "rounded-lg",
      };
    case "zestawy":
    case "karty":
      return {
        card: "rounded-xl border border-czerwony/50",
        photo: "rounded-lg",
      };
    default:
      return {
        card: "rounded-xl border border-szary",
        photo: "rounded-lg",
      };
  }
}
