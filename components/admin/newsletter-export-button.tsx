"use client";

export function NewsletterExportButton({ rows }: { rows: { email: string; createdAt: string }[] }) {
  function download() {
    const header = "email;zapis;zgoda_marketing";
    const body = rows.map((row) => `${row.email};${row.createdAt || ""};tak`).join("\n");
    const blob = new Blob([`${header}\n${body}\n`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "newsletter-trzywiatry.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="h-10 rounded-lg border border-czarny/15 bg-bialy px-4 text-xs font-medium text-czarny/70 hover:border-czerwony hover:text-czerwony"
    >
      Pobierz CSV
    </button>
  );
}
