"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/field";
import { nameLiveError } from "@/lib/validations/live-fields";
import { cn } from "@/lib/utils";

type TextFieldProps = {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
};

export function TextField({
  name,
  label,
  required = true,
  defaultValue = "",
  placeholder,
  autoComplete = "name",
  className,
  inputClassName,
  labelClassName,
}: TextFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [touched, setTouched] = useState(false);
  const error = nameLiveError(value, {
    required,
    touched: touched || value.length > 0,
    label: label.split("/")[0]?.trim() || "Imię",
  });
  const invalid = Boolean(error);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className={labelClassName}>
        {label}
        {required ? <span className="text-czerwony"> *</span> : null}
      </Label>
      <Input
        id={name}
        name={name}
        type="text"
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        value={value}
        aria-invalid={invalid}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={(event) => {
          setValue(event.target.value);
          if (!touched && event.target.value.length > 0) setTouched(true);
        }}
        onBlur={() => setTouched(true)}
        className={cn(invalid && touched ? "border-czerwony/50" : null, inputClassName)}
      />
      {error ? (
        <p id={`${name}-error`} className="text-xs text-czerwony" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
