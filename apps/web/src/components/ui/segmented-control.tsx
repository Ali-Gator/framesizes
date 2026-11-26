"use client";

import { type KeyboardEvent, useRef } from "react";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  /** Not offered now: greyed out, skipped by the arrow keys. */
  disabled?: boolean;
  /** An element that says why, for a disabled option. */
  describedBy?: string;
}

const SIZES = {
  md: "h-9 min-w-[52px] px-4 text-[15px]",
  sm: "h-[30px] min-w-10 px-3 text-sm",
};

const STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * Two to four exclusive options in a pill track (design system SegmentedControl): a radiogroup whose
 * arrow keys move and select, with focus on the selected option only.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
}: {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: keyof typeof SIZES;
  /** Extra classes on the group, a hook for page CSS. */
  className?: string;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const step = STEP[event.key];
    if (!step) return;
    event.preventDefault();
    // The next enabled option in that direction; none other than this one: stay.
    let next = index;
    for (let n = 1; n < options.length; n++) {
      const i = (index + step * n + options.length * n) % options.length;
      if (!options[i]?.disabled) {
        next = i;
        break;
      }
    }
    const option = options[next];
    if (!option || next === index) return;
    onChange(option.value);
    buttons.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`inline-flex gap-0.5 rounded-pill border-[1.5px] border-line-strong bg-paper p-[3px]${className ? ` ${className}` : ""}`}
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              buttons.current[index] = el;
            }}
            type="button"
            role="radio"
            data-value={option.value}
            aria-checked={checked}
            disabled={option.disabled}
            aria-describedby={option.describedBy}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`${SIZES[size]} cursor-pointer rounded-pill font-semibold disabled:cursor-not-allowed disabled:opacity-45 forced-colors:border-2 ${
              checked
                ? "bg-tape text-on-tape shadow-[inset_0_0_0_1.5px_var(--ink)] forced-colors:border-[Highlight]"
                : "text-ink-muted enabled:hover:text-ink forced-colors:border-[Canvas]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
