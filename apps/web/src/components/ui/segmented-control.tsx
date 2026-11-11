"use client";

import { type KeyboardEvent, useRef } from "react";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
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
}: {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: keyof typeof SIZES;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const step = STEP[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    const option = options[next];
    if (!option) return;
    onChange(option.value);
    buttons.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex gap-0.5 rounded-pill border-[1.5px] border-line-strong bg-paper p-[3px]"
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
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`${SIZES[size]} cursor-pointer rounded-pill font-semibold ${
              checked
                ? "bg-tape text-on-tape shadow-[inset_0_0_0_1.5px_var(--ink)]"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
