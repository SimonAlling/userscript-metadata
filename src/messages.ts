import { KEY } from "./key";
import { tag } from "./syntax";

const TAG_INCLUDE = tag(KEY.include);
const TAG_MATCH = tag(KEY.match);

export const onlyTrueAllowed = "Only true allowed.";
export const someNonWhitespaceRequired = "At least one non-whitespace character is required.";
export const emptyStringNotAllowed = "The empty string is not allowed.";
export const whitespaceNotAllowed = "Whitespace is not allowed.";
export const lineBreaksNotAllowed = "Line breaks are not allowed.";
export const leadingWhitespaceNotAllowed = "Leading whitespace is not allowed.";
export const trailingWhitespaceNotAllowed = "Trailing whitespace is not allowed.";
export const validMatchPatternRequired = `Value must be a valid @match pattern (e.g. "*://example.com/*").`;
export const semanticVersionRequired = `Value must follow the Semantic Versioning format, e.g. "1.0.5".`;
export const noMatchOrIncludeSummary = `No ${TAG_MATCH} or ${TAG_INCLUDE} directive.`;
export const noMatchOrIncludeDescription = `${TAG_MATCH} and/or ${TAG_INCLUDE} directives are used to indicate on which URLs the userscript should run. If neither is present, the userscript may run on ALL or NO URLs, depending on the userscript client.`;
export const matchInsteadOfIncludeSummary = `${TAG_INCLUDE} directive can be replaced with ${TAG_MATCH}.`;
export const matchInsteadOfIncludeDescription = `
The ${TAG_INCLUDE} directive is generally not recommended, since its asterisk (*) has a less safe meaning than in the ${TAG_MATCH} directive.

There is one case where ${TAG_INCLUDE} is preferable, though: It supports regular expressions, while ${TAG_MATCH} only supports match patterns as defined here:

    https://developer.chrome.com/extensions/match_patterns

Unless you need regular expressions, consider using ${TAG_MATCH} instead.
`.trim();
