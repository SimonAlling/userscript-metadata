import { Either, Entry, Entries, Left, Right } from "./types";
import { START_TAG, END_TAG, TAG_PREFIX } from "./syntax";
import { r } from "./common";

const extractComments: (s: string) => ReadonlyArray<Comment> = require("extract-comments");

const REGEX_START_TAG = new RegExp(r`^\s*` + START_TAG + r`\s*$`);
const REGEX_END_TAG   = new RegExp(r`^\s*` + END_TAG   + r`\s*$`);

interface Comment {
    type: "LineComment" | "BlockComment"
    value: string
    raw: string
}

export const enum ExtractionError {
    NO_LINE_COMMENTS,
    NO_START_TAG,
    NO_END_TAG,
    END_TAG_BEFORE_START_TAG,
}

export type ExtractionResult = Either<ExtractionError, string>

export type BlockParseResult = Either<ReadonlyArray<string>, Entries>

type LineParseResult = Either<string, Entry>

export function extractBlock(userscript: string): ExtractionResult {
    const lineComments = (
        extractComments(userscript)
        .filter(c => c.type === "LineComment")
        .map(c => c.raw)
    );
    if (lineComments.length === 0) {
        return { label: Left, content: ExtractionError.NO_LINE_COMMENTS };
    } else {
        const startTagIndex = lineComments.findIndex(x => REGEX_START_TAG.test(x));
        const endTagIndex = lineComments.findIndex(x => REGEX_END_TAG.test(x));
        if (startTagIndex < 0) {
            return { label: Left, content: ExtractionError.NO_START_TAG };
        } else if (endTagIndex < 0) {
            return { label: Left, content: ExtractionError.NO_END_TAG };
        } else if (endTagIndex < startTagIndex) {
            return { label: Left, content: ExtractionError.END_TAG_BEFORE_START_TAG };
        } else {
            return { label: Right, content: lineComments.slice(startTagIndex+1, endTagIndex).join("\n") };
        }
    }
}

export function parseBlock(block: string): BlockParseResult {
    const lines = block.split("\n").filter(line => /\S/.test(line));
    const validEntries: Entry[] = [];
    const invalidLines: string[] = [];
    lines.map(parseLine).forEach(result => {
        if (result.label === Left) {
            invalidLines.push(result.content);
        } else {
            validEntries.push(result.content);
        }
    });
    return invalidLines.length > 0 ? {
        label: Left,
        content: invalidLines,
    } : {
        label: Right,
        content: validEntries,
    };
}

// `line` is expected to be a line without any comment prefix, but leading whitespace is OK.
export function parseLine(line: string): LineParseResult {
    const match = line.match(new RegExp(
        r`^\s*` + TAG_PREFIX + r`([a-z\-]+)` + r`(?:\s*|\s+(\S.*))$`,
        "i",
    ));
    if (match === null) {
        return { label: Left, content: line };
    } else {
        const key = match[1];
        const value = match[2];
        return {
            label: Right,
            content: { key, value: value ? value.trimRight() : true },
        };
    }
}
