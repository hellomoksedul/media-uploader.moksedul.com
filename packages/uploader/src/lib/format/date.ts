/**
 * Shared date formatting helpers.
 *
 * These replace the copy-pasted `toLocaleDateString(...)` blocks that were
 * duplicated across billing cards, tables and media views. Keep new date
 * output going through one of these so the app stays consistent.
 */

type DateInput = string | number | Date;

function toDate(input: DateInput): Date {
  return input instanceof Date ? input : new Date(input);
}

/** "January 5, 2026" — long month, used on billing / plan surfaces. */
export function formatLongDate(input: DateInput): string {
  return toDate(input).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** "5 Jan 2026" — compact with year, used in tables. */
export function formatMediumDate(input: DateInput): string {
  return toDate(input).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "Jan 5" — day + month only, used on cards / thumbnails. */
export function formatShortDate(input: DateInput): string {
  return toDate(input).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** "Jan 5, 2026" — short month with year, used in media detail. */
export function formatShortDateWithYear(input: DateInput): string {
  return toDate(input).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
