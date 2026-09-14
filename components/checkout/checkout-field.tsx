"use client";

import { Input, Label } from "@/components/ui/field";

export function CheckoutField({
  name,
  label,
  type = "text",
  placeholder,
  defaultValue,
  value,
  onChange,
  required = true,
  autoComplete,
  hint,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
}) {
  const controlled = onChange !== undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required ? <span className="text-czerwony"> *</span> : null}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        {...(controlled
          ? { value: value ?? "", onChange: (event) => onChange(event.target.value) }
          : { defaultValue })}
      />
      {hint ? <p className="text-xs text-szary">{hint}</p> : null}
    </div>
  );
}
