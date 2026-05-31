/**
 * A tiny, dependency-free `classNames` helper. Joins truthy class values into a
 * single space-separated string. Accepts strings, conditionals, and arrays.
 *
 * Falsy values (including `0`) are dropped, matching the familiar `clsx` behavior.
 *
 * @example
 * ```ts
 * cn('btn', isActive && 'btn-active', ['extra', null]); // "btn btn-active extra"
 * ```
 */
export type ClassValue = string | number | null | false | undefined | ClassValue[];

export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) out.push(nested);
    } else {
      out.push(String(value));
    }
  }
  return out.join(' ');
}
