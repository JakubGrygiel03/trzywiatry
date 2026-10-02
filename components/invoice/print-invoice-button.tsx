"use client";

export function PrintInvoiceButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-czarny/12 px-3.5 py-2 text-xs font-medium text-czarny print:hidden hover:border-czerwony hover:text-czerwony"
    >
      Drukuj / PDF
    </button>
  );
}
