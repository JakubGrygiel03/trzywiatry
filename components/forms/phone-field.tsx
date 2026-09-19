"use client";

import { useMemo, useState } from "react";
import { Input, Label } from "@/components/ui/field";
import {
  formatNationalPhone,
  nationalDigitsOnly,
  phoneLiveError,
  PHONE_COUNTRIES,
  splitPhone,
  toE164,
  NATIONAL_PHONE_DIGITS,
} from "@/lib/phone";
import { cn } from "@/lib/utils";

type PhoneFieldProps = {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
};

export function PhoneField({
  name,
  label,
  required = true,
  defaultValue = "",
  className,
  inputClassName,
  labelClassName,
}: PhoneFieldProps) {
  const initial = useMemo(() => splitPhone(defaultValue), [defaultValue]);
  const [dial, setDial] = useState(initial.dial);
  const [national, setNational] = useState(initial.national);
  const [touched, setTouched] = useState(false);

  const e164 = toE164(dial, national);
  const digits = nationalDigitsOnly(national);
  const showError = touched || digits.length > 0;
  const error = showError ? phoneLiveError(dial, national, required) : null;
  const complete = digits.length === NATIONAL_PHONE_DIGITS;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={`${name}-national`} className={labelClassName}>
        {label}
        {required ? <span className="text-czerwony"> *</span> : null}
      </Label>

      <div className="flex gap-2">
        <label className="sr-only" htmlFor={`${name}-dial`}>
          Kod kraju
        </label>
        <select
          id={`${name}-dial`}
          value={dial}
          onChange={(event) => {
            setDial(event.target.value);
            setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          className={cn(
            "w-[7.5rem] shrink-0 rounded-2xl border border-czarny/10 bg-bialy px-2 text-sm outline-none focus:border-czerwony sm:w-[9rem]",
            inputClassName ?? "h-11",
          )}
          aria-label="Kod kraju"
        >
          {PHONE_COUNTRIES.map((country) => (
            <option key={country.dial} value={country.dial}>
              {country.hint} · {country.label}
            </option>
          ))}
        </select>

        <Input
          id={`${name}-national`}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="123-456-789"
          value={national}
          maxLength={NATIONAL_PHONE_DIGITS + 2}
          required={required}
          pattern={required ? "\\d{3}-\\d{3}-\\d{3}" : undefined}
          title={`Wpisz ${NATIONAL_PHONE_DIGITS} cyfr, np. 123-456-789`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : `${name}-hint`}
          onChange={(event) => {
            setNational(formatNationalPhone(event.target.value));
            setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          className={cn(
            "min-w-0 flex-1 tracking-[0.08em]",
            error ? "border-czerwony/50" : null,
            inputClassName,
          )}
        />
      </div>

      <input type="hidden" name={name} value={required || digits.length > 0 ? e164 : ""} readOnly />

      <p id={`${name}-hint`} className="text-xs text-czarny/45">
        Wybierz kierunek (domyślnie Polska +48), potem {NATIONAL_PHONE_DIGITS} cyfr z kreskami co trzy.
      </p>
      {error ? (
        <p id={`${name}-error`} className="text-xs text-czerwony" role="alert">
          {error}
        </p>
      ) : complete && touched ? (
        <p className="text-xs text-czarny/45">Numer wygląda poprawnie ({e164}).</p>
      ) : null}
    </div>
  );
}
