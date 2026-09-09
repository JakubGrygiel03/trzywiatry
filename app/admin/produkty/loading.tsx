export default function AdminProductsLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6" aria-hidden>
      <div className="flex justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-32 rounded-md bg-krem-ciemny/80" />
          <div className="h-4 w-64 rounded-md bg-krem/90" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-krem-ciemny/70" />
      </div>
      <div className="overflow-hidden rounded-xl bg-bialy ring-1 ring-czarny/6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-czarny/5 px-4 py-3 last:border-0">
            <div className="h-12 w-12 rounded-lg bg-krem" />
            <div className="h-4 flex-1 max-w-xs rounded bg-krem" />
            <div className="hidden h-4 w-20 rounded bg-krem sm:block" />
            <div className="hidden h-4 w-16 rounded bg-krem md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
