import { Entries, EntriesOptions, Entry, Metadata, SingleValue, Options } from "./types";
import { fromMaybe } from "./common";
import { toEntries } from "./conversion";
import { UNDERSCORES_AS_HYPHENS_DEFAULT } from "./validation";
import { START_TAG, END_TAG, COMMENT_PREFIX, TAG_PREFIX } from "./syntax";

const ALIGN_DEFAULT = true;
const MINIFY_DEFAULT = false;
const SPACING_DEFAULT = 2;

export function stringify(metadata: Metadata, options: Options = {}): string {
    const underscoresAsHyphens = fromMaybe(UNDERSCORES_AS_HYPHENS_DEFAULT, options.underscoresAsHyphens);
    const entries = toEntries(metadata, underscoresAsHyphens);
    return stringifyEntries(entries, options);
}

export function stringifyEntries(entries: Entries, options: EntriesOptions = {}) {
    // minify option overrides align and spacing.
    const minify = fromMaybe(MINIFY_DEFAULT, options.minify);
    const align = minify ? false : fromMaybe(ALIGN_DEFAULT, options.align);
    const spacing = minify ? 1 : fromMaybe(SPACING_DEFAULT, options.spacing);
    return (
        (<string[]> [])
        .concat(START_TAG)
        .concat(entries.map(stringifyEntry({
            columnWidth: align ? lengthOfLongestTagIn(entries) : 0,
            spacing,
        })))
        .concat(END_TAG)
        .map(line => COMMENT_PREFIX + (minify ? "" : " ") + line)
        .join("\n")
    );
}

// align is basically the length of the longest tag.
function stringifyEntry(x: {
    columnWidth: number
    spacing: number
}): (entry: Entry) => string {
    return entry => (
        TAG_PREFIX + entry.key // tag
        + " ".repeat(Math.max(0, zeroIfNaN(x.columnWidth) - entry.key.length)) // padding (at least 0)
        + " ".repeat(Math.max(1, oneIfNaN(x.spacing))) // spacing (at least 1)
        + stringifyValue(entry.value) // value
    ).trimRight(); // no trailing whitespace on boolean tags
}

function stringifyValue(value: SingleValue): string {
    return value === true ? "" : value;
}

function zeroIfNaN(x: number): number {
    return Number.isNaN(x) ? 0 : x;
}

function oneIfNaN(x: number): number {
    return Number.isNaN(x) ? 1 : x;
}

function lengthOfLongestTagIn(entries: Entries): number {
    return Math.max(...entries.map(entry => entry.key.length));
}
