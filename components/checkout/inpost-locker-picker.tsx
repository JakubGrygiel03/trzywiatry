"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { InpostLockerModal } from "@/components/checkout/inpost-locker-modal";
import { formatLockerLabel } from "@/lib/inpost-points";
import { cn } from "@/lib/utils";

export function InpostLockerPicker({
  postalCode,
  city,
  value,
  onChange,
}: {
  postalCode: string;
  city: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor="inpostLocker">
        Paczkomat InPost <span className="text-czerwony">*</span>
      </Label>
      <p className="text-xs text-szary">
        Wybierz punkt na mapie — nie musisz znać numeru. Adres powyżej zostaje do faktury i kontaktu.
      </p>
      <Button type="button" variant="outline" className="w-full" onClick={() => setOpen(true)}>
        {value ? "Zmień paczkomat na mapie" : "Wybierz paczkomat na mapie"}
      </Button>
      <Input
        id="inpostLocker"
        name="inpostLocker"
        value={value}
        readOnly
        required
        placeholder="Nie wybrano — otwórz mapę"
        className={cn(value ? "bg-krem" : "bg-bialy")}
      />
      {open ? (
        <InpostLockerModal
          postalCode={postalCode}
          city={city}
          selectedLabel={value}
          onClose={() => setOpen(false)}
          onSelect={(point) => {
            onChange(formatLockerLabel(point));
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
