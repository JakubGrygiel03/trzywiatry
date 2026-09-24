"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/field";
import { emailLiveError } from "@/lib/validations/live-fields";
import { cn } from "@/lib/utils";

type EmailFieldProps = {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  hint?: string;
  hideLabel?: boolean;
  onValueChange?: (value: string) => void;
};

export function EmailField({
  name,
  label,
  required = true,
  defaultValue = "",
  placeholder = "jan@example.pl",
  autoComplete = "email",
  className,
  inputClassName,
  labelClassName,
  hint,
  hideLabel = false,
  onValueChange,
}: EmailFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [touched, setTouched] = useState(false);
  const error = emailLiveError(value, { required, touched: touched || value.length > 0 });
  const invalid = Boolean(error);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className={cn(hideLabel && "sr-only", labelClassName)}>
        {label}
        {required && !hideLabel ? <span className="text-czerwony"> *</span> : null}
      </Label>
      <Input
        id={name}
        name={name}
        type="email"
        inputMode="email"
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        value={value}
        aria-invalid={invalid}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        onChange={(event) => {
          setValue(event.target.value);
          onValueChange?.(event.target.value);
          if (!touched && event.target.value.length > 2) setTouched(true);
        }}
        onBlur={() => setTouched(true)}
        className={cn(invalid && touched ? "border-czerwony/50" : null, inputClassName)}
      />
      {hint ? (
        <p id={`${name}-hint`} className="text-xs text-czarny/45">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${name}-error`} className="text-xs text-czerwony" role="alert">
          {error}
        </p>
      ) : value.trim() && !error && touched ? (
        <p className="text-xs text-czarny/45">E-mail wygląda poprawnie.</p>
      ) : null}
    </div>
  );
}
