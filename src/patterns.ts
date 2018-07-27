import * as escapeStringRegexp from "escape-string-regexp";
import { r } from "./common";

type NullOr<T> = T | null;

const REGEX_MATCH_ALL = r`<all_urls>`;
const REGEX_MATCH_SCHEME = r`\*|https?`;
const REGEX_MATCH_HOST = r`(?:\*\.)*[^\/\*]+|\*`;
const REGEX_MATCH_PATH = r`\/.*`;
const MATCH_PATTERN_ALL_NORMALIZED = r`*://*/*`;

// Outer parentheses necessary to enclose `|`:
const REGEX_MATCH_PATTERN = new RegExp(
      r`^(?:` + REGEX_MATCH_ALL + r`|`
    + r`(` + REGEX_MATCH_SCHEME + r`):\/\/`
    + r`(` + REGEX_MATCH_HOST   + r`)`
    + r`(` + REGEX_MATCH_PATH   + r`)`
    + r`)$`
);

const enum Group {
    EVERYTHING,
    SCHEME,
    HOST,
    PATH,
};

const REGEX_INCLUDE_PATTERN_SIMPLE = r`^(.+)$`;
const REGEX_INCLUDE_PATTERN_REGEX = r`^\/(.+)\/$`;
const REGEX_INCLUDE_PATTERN = new RegExp(
    REGEX_INCLUDE_PATTERN_REGEX + "|" + REGEX_INCLUDE_PATTERN_SIMPLE
);

export function normalizeMatchPattern(pattern: string): string {
    return pattern === REGEX_MATCH_ALL ? MATCH_PATTERN_ALL_NORMALIZED : pattern;
}

export function isMatchPattern(pattern: string): boolean {
    return REGEX_MATCH_PATTERN.test(pattern);
}

export function isIncludePattern(pattern: string): boolean {
    return REGEX_INCLUDE_PATTERN.test(pattern);
}

export function isIncludePattern_regex(pattern: string): boolean {
    return new RegExp(REGEX_INCLUDE_PATTERN_REGEX).test(pattern);
}

function withoutSurroundingSlashes(s: string): string {
    return s.replace(/^\/|\/$/g, "");
}

export function regexFromIncludePattern(pattern: string): RegExp {
    return (
        isIncludePattern_regex(pattern)
        ? new RegExp(withoutSurroundingSlashes(pattern), "i")
        : new RegExp(r`^` + regexify(pattern) + r`$`, "i")
    );
}

function regexify(segment: string): string {
    return escapeStringRegexp(segment).replace(new RegExp(r`\\\*`, "g"), ".*");
}

// Returns null if the pattern is invalid:
function extractGroup(group: Group, matchPattern: string): NullOr<string> {
    try {
        const match = normalizeMatchPattern(matchPattern).match(REGEX_MATCH_PATTERN);
        return match === null ? null : match[group];
    } catch (_) {
        return null;
    }
}

export function schemeIn(matchPattern: string): NullOr<string> {
    return extractGroup(Group.SCHEME, matchPattern);
}

export function hostIn(matchPattern: string): NullOr<string> {
    return extractGroup(Group.HOST, matchPattern);
}

export function pathIn(matchPattern: string): NullOr<string> {
    return extractGroup(Group.PATH, matchPattern);
}
