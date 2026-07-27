import { Button } from "@/components/common/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import * as RPNInput from "react-phone-number-input";

type PhoneInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
    /** Lock the country (no dropdown) — used where only one country is valid,
     *  e.g. BD-only flows. Renders a static flag instead of a picker. */
    disableCountrySelect?: boolean;
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, defaultCountry, value, disableCountrySelect, ...props }, ref) => {
      const [detectedCountry, setDetectedCountry] = React.useState<RPNInput.Country>();

      React.useEffect(() => {
        if (!defaultCountry) {
          fetch("https://api.country.is/")
            .then((res) => res.json())
            .then((data) => {
              if (data && data.country) {
                setDetectedCountry(data.country as RPNInput.Country);
              }
            })
            .catch(() => setDetectedCountry("US"));
        }
      }, [defaultCountry]);

      const targetCountry = defaultCountry || detectedCountry;

      const callingCode = React.useMemo(() => {
        if (!targetCountry) return "";
        try {
          return RPNInput.getCountryCallingCode(targetCountry);
        } catch {
          return "";
        }
      }, [targetCountry]);

      const prefix = callingCode ? `+${callingCode}` : "";

      const formattedValue = React.useMemo(() => {
        let strVal = typeof value === "string" ? value : "";
        if (!strVal || strVal === "+") {
          return (disableCountrySelect && prefix ? prefix : strVal) as RPNInput.Value;
        }

        if (disableCountrySelect && prefix) {
          if (!strVal.startsWith(prefix)) {
            const digitsOnly = strVal.replace(/\D/g, "");
            let cleanDigits = digitsOnly.startsWith(callingCode)
              ? digitsOnly.slice(callingCode.length)
              : digitsOnly;
            if (cleanDigits.startsWith("0")) {
              cleanDigits = cleanDigits.replace(/^0+/, "");
            }
            strVal = `${prefix}${cleanDigits}`;
          } else {
            const afterPrefix = strVal.slice(prefix.length);
            if (afterPrefix.startsWith("0")) {
              strVal = `${prefix}${afterPrefix.replace(/^0+/, "")}`;
            }
          }

          // Strictly limit to 10 digits after +880
          const digitsAfterPrefix = strVal.slice(prefix.length).replace(/\D/g, "");
          if (digitsAfterPrefix.length > 10) {
            strVal = `${prefix}${digitsAfterPrefix.slice(0, 10)}`;
          }
          return strVal as RPNInput.Value;
        }

        // Worldwide dynamic max length capping
        if (strVal && strVal.startsWith("+")) {
          let trimmed = strVal;
          while (trimmed.length > 4 && !RPNInput.isPossiblePhoneNumber(trimmed)) {
            trimmed = trimmed.slice(0, -1);
          }
          if (RPNInput.isPossiblePhoneNumber(trimmed)) {
            return trimmed as RPNInput.Value;
          }
        }

        if (targetCountry && !strVal.startsWith("+")) {
          const parsed = RPNInput.parsePhoneNumber(strVal, targetCountry);
          if (parsed && parsed.number) {
            return parsed.number as RPNInput.Value;
          }
        }
        return strVal as RPNInput.Value;
      }, [value, targetCountry, disableCountrySelect, prefix, callingCode]);

      const handlePhoneChange = React.useCallback(
        (newVal?: RPNInput.Value) => {
          if (!onChange) return;
          let strVal = typeof newVal === "string" ? newVal : "";
          const prevVal = typeof value === "string" ? value : "";

          if (disableCountrySelect && prefix) {
            if (!strVal || strVal === "+" || !strVal.startsWith(prefix)) {
              const digitsOnly = strVal.replace(/\D/g, "");
              let cleanDigits = digitsOnly.startsWith(callingCode)
                ? digitsOnly.slice(callingCode.length)
                : digitsOnly;
              if (cleanDigits.startsWith("0")) {
                cleanDigits = cleanDigits.replace(/^0+/, "");
              }
              strVal = `${prefix}${cleanDigits}`;
            } else {
              const afterPrefix = strVal.slice(prefix.length);
              if (afterPrefix.startsWith("0")) {
                strVal = `${prefix}${afterPrefix.replace(/^0+/, "")}`;
              }
            }

            // Cap at 10 digits max after +880
            const digitsAfterPrefix = strVal.slice(prefix.length).replace(/\D/g, "");
            if (digitsAfterPrefix.length > 10) {
              strVal = `${prefix}${digitsAfterPrefix.slice(0, 10)}`;
            }
          }

          // Dynamic worldwide phone length protection
          if (strVal && strVal.startsWith("+") && strVal.length > prevVal.length) {
            if (prevVal && RPNInput.isPossiblePhoneNumber(prevVal) && !RPNInput.isPossiblePhoneNumber(strVal)) {
              onChange(prevVal as RPNInput.Value);
              return;
            }
            if (!RPNInput.isPossiblePhoneNumber(strVal)) {
              let trimmed = strVal;
              while (trimmed.length > 4 && !RPNInput.isPossiblePhoneNumber(trimmed)) {
                trimmed = trimmed.slice(0, -1);
              }
              if (RPNInput.isPossiblePhoneNumber(trimmed)) {
                onChange(trimmed as RPNInput.Value);
                return;
              }
            }
          }

          onChange(strVal as RPNInput.Value);
        },
        [onChange, value, disableCountrySelect, prefix, callingCode]
      );

      if (!defaultCountry && !detectedCountry) {
        return (
          <div
            className={cn(
              "flex items-center w-full h-11 rounded-lg border border-border bg-card transition-colors animate-pulse",
              className
            )}
          />
        );
      }

      return (
        <RPNInput.default
          ref={ref}
          className={cn(
            "flex items-center w-full h-11 rounded-lg border border-border bg-card focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-colors overflow-hidden",
            className
          )}
          flagComponent={FlagComponent}
          countrySelectComponent={
            disableCountrySelect ? LockedCountrySelect : CountrySelect
          }
          inputComponent={InputComponent}
          international
          withCountryCallingCode
          defaultCountry={defaultCountry || detectedCountry}
          countries={
            disableCountrySelect && (defaultCountry || detectedCountry)
              ? [defaultCountry || (detectedCountry as RPNInput.Country)]
              : undefined
          }
          value={formattedValue as RPNInput.Value}
          onChange={(val) => handlePhoneChange(val as RPNInput.Value)}
          {...props}
        />
      );
    },
  );
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, onKeyDown, onChange, onClick, onSelect, value, ...props }, ref) => {
    const prefix = "+880";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawVal = e.target.value;
      const digitsOnly = rawVal.replace(/\D/g, "");

      // For BD prefix (+880), strictly enforce max 10 digits after +880
      if (rawVal.startsWith(prefix) || rawVal.startsWith("880") || rawVal.startsWith("+880")) {
        let cleanDigits = digitsOnly;
        if (cleanDigits.startsWith("880")) {
          cleanDigits = cleanDigits.slice(3);
        }
        if (cleanDigits.startsWith("0")) {
          cleanDigits = cleanDigits.replace(/^0+/, "");
        }
        if (cleanDigits.length > 10) {
          cleanDigits = cleanDigits.slice(0, 10);
        }
        e.target.value = `${prefix} ${cleanDigits}`;
      } else if (rawVal.startsWith("+")) {
        // Worldwide check
        if (digitsOnly.length > 3 && !RPNInput.isPossiblePhoneNumber(rawVal.replace(/\s+/g, ""))) {
          let trimmed = rawVal.replace(/\s+/g, "");
          while (trimmed.length > 4 && !RPNInput.isPossiblePhoneNumber(trimmed)) {
            trimmed = trimmed.slice(0, -1);
          }
          e.target.value = trimmed;
        }
      }

      onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      const valStr = typeof value === "string" ? value : "";

      if (valStr.startsWith(prefix)) {
        const prefixLen = prefix.length;

        // Prevent Backspace from deleting inside or immediately after prefix
        if (e.key === "Backspace") {
          if (start <= prefixLen && end <= prefixLen) {
            e.preventDefault();
            input.setSelectionRange(prefixLen, prefixLen);
            return;
          }
        }

        // Prevent Delete key inside prefix
        if (e.key === "Delete" && start < prefixLen) {
          e.preventDefault();
          input.setSelectionRange(prefixLen, prefixLen);
          return;
        }
      }

      onKeyDown?.(e);
    };

    const enforceCursor = (input: HTMLInputElement) => {
      const valStr = typeof value === "string" ? value : "";
      if (valStr.startsWith(prefix)) {
        const prefixLen = prefix.length;
        if ((input.selectionStart ?? 0) < prefixLen && input.selectionStart === input.selectionEnd) {
          input.setSelectionRange(prefixLen, prefixLen);
        }
      }
    };

    return (
      <Input
        ref={ref}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClick={(e) => {
          enforceCursor(e.currentTarget);
          onClick?.(e);
        }}
        onSelect={(e) => {
          enforceCursor(e.currentTarget);
          onSelect?.(e);
        }}
        className={cn(
          "rounded-e-lg rounded-s-none border-0 focus-visible:ring-0 h-full shadow-none bg-transparent py-0 px-3.5 font-medium",
          className
        )}
        {...props}
      />
    );
  }
);
InputComponent.displayName = "InputComponent";

type CountrySelectOption = { label: string; value: RPNInput.Country };
type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: CountrySelectOption[];
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = React.useCallback(
    (country: RPNInput.Country) => {
      onChange(country);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "flex items-center justify-center gap-1 rounded-e-none rounded-s-lg px-3.5",
            "focus-visible:ring-0 hover:bg-transparent bg-transparent border-0 border-r border-border",
            "h-full self-stretch shadow-none"
          )}
          disabled={disabled}
        >
          <FlagComponent country={value} countryName={value} />
          <ChevronsUpDown
            className={cn(
              "-mr-1 size-4 opacity-50 shrink-0",
              disabled ? "hidden" : "opacity-100",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-75 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList className="max-h-75 overflow-y-auto">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options
                .filter((x) => x.value)
                .map((option) => (
                  <CommandItem
                    className="gap-2"
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <FlagComponent
                      country={option.value}
                      countryName={option.label}
                    />
                    <span className="flex-1 text-sm">{option.label}</span>
                    {option.value && (
                      <span className="text-foreground/50 text-sm">
                        {`+${RPNInput.getCountryCallingCode(option.value)}`}
                      </span>
                    )}
                    <Check
                      className={cn(
                        "ml-auto size-4",
                        option.value === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const LockedCountrySelect = ({ value }: CountrySelectProps) => (
  <div
    className={cn(
      "flex items-center justify-center gap-1 rounded-s-lg px-3.5 h-full self-stretch",
      "border-0 border-r border-border",
      "select-none shrink-0",
    )}
    aria-disabled="true"
  >
    <FlagComponent country={value} countryName={value} />
  </div>
);

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  if (!country) return <span className="flex h-3.5 w-5 shrink-0 bg-muted rounded-[2px]" />;
  return (
    <span className="inline-flex items-center justify-center h-3.5 w-5 overflow-hidden rounded-[2px] shrink-0 my-auto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://flagcdn.com/w40/${country.toLowerCase()}.png`}
        srcSet={`https://flagcdn.com/w80/${country.toLowerCase()}.png 2x`}
        alt={countryName}
        className="h-full w-full object-cover"
      />
    </span>
  );
};
FlagComponent.displayName = "FlagComponent";

export { PhoneInput };
