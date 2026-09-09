export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6" aria-hidden>
      <div className="space-y-2 border-b border-czarny/6 pb-5">
        <div className="h-7 w-44 rounded-md bg-krem-ciemny/80" />
        <div className="h-4 w-80 max-w-full rounded-md bg-krem/90" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-bialy ring-1 ring-czarny/6" />
        ))}
      </div>
      <div className="h-72 rounded-xl bg-bialy ring-1 ring-czarny/6" />
    </div>
  );
}
