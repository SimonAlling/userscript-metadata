export const r = String.raw; // Python-style raw strings

export interface Constraint<T> {
    readonly requirement: (x: T) => boolean
    readonly message: string
}

export function id<T>(x: T): T {
    return x;
}

export function not<T>(f: (x: T) => boolean): (x: T) => boolean {
    return x => !f(x);
}

export function fromMaybeUndefined<T>(fallback: T, x: T | undefined): T {
    return x === undefined ? fallback : x;
}

export function isEmpty(x: string) {
    return x === "";
}

export function containsWhitespace(x: string) {
    return /\s/.test(x);
}

export function containsOnlyWhitespace(x: string) {
    return /^\s*$/.test(x);
}

export function containsLeadingWhitespace(x: string) {
    return /^\s/.test(x);
}

export function containsTrailingWhitespace(x: string) {
    return /\s$/.test(x);
}

export function containsLineBreaks(x: string) {
    return x.includes("\n");
}

export function replaceHyphens(s: string): string {
    return s.replace(/\-/g, "_");
}

export function replaceUnderscores(s: string): string {
    return s.replace(/_/g, "-");
}
