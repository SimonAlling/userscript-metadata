import { r } from "../src/common";
import { Left, Right } from "../src/types";
import { readAndValidate } from "../src/index";
import {
    ExtractionError,
    parseLine, extractBlock,
} from "../src/read";

const TYPICAL_USERSCRIPT = r`
// ==UserScript==
// @name Example Userscript
// @version 1.0.0
// @noframes
// ==/UserScript==
"use strict";
const foo = "foo";
// bar
const bar = "bar";
`;

const ENTRY_NAME = { key: "name", value: "Example Userscript" };
const ENTRY_NOFRAMES = { key: "noframes", value: true };

function failure(line: string) { return { label: Left, content: line }; }
const LINE_RESULT_NAME = { label: Right, content: ENTRY_NAME };
const LINE_RESULT_NOFRAMES = { label: Right, content: ENTRY_NOFRAMES };

const EXTRACT_RESULT_EMPTY = { label: Right, content: "" };
const EXTRACT_RESULT_NO_COMMENTS = { label: Left, content: ExtractionError.NO_LINE_COMMENTS };
const EXTRACT_RESULT_NO_START_TAG = { label: Left, content: ExtractionError.NO_START_TAG };
const EXTRACT_RESULT_NO_END_TAG = { label: Left, content: ExtractionError.NO_END_TAG };
const EXTRACT_RESULT_END_TAG_BEFORE_START_TAG = { label: Left, content: ExtractionError.END_TAG_BEFORE_START_TAG };

const READ_AND_VALIDATE_RESULT_TYPICAL = { label: Right, content: {
    name: "Example Userscript",
    version: "1.0.0",
    noframes: true,
} };

it("a valid string entry is correctly parsed", () => {
    expect(parseLine("@name Example Userscript")).toEqual(LINE_RESULT_NAME);
    expect(parseLine(" @name Example Userscript")).toEqual(LINE_RESULT_NAME);
    expect(parseLine("@name Example Userscript ")).toEqual(LINE_RESULT_NAME);
    expect(parseLine(" @name Example Userscript ")).toEqual(LINE_RESULT_NAME);
    expect(parseLine("@name   Example Userscript")).toEqual(LINE_RESULT_NAME);
});

it("a valid boolean entry is correctly parsed", () => {
    expect(parseLine("@noframes")).toEqual(LINE_RESULT_NOFRAMES);
    expect(parseLine(" @noframes")).toEqual(LINE_RESULT_NOFRAMES);
    expect(parseLine("@noframes ")).toEqual(LINE_RESULT_NOFRAMES);
    expect(parseLine(" @noframes ")).toEqual(LINE_RESULT_NOFRAMES);
    expect(parseLine("@noframes   ")).toEqual(LINE_RESULT_NOFRAMES);
});

function expectLineFailure(line: string): void {
    expect(parseLine(line)).toEqual(failure(line));
}

it("parsing fails for an empty line", () => {
    [ "", " ", "  " ].forEach(expectLineFailure);
});

it("parsing fails for a line with no @", () => {
    [ "name", "name Invalid Userscript" ].forEach(expectLineFailure);
});

it("the empty block is properly extracted", () => {
    expect(extractBlock(`
        // ==UserScript==
        // ==/UserScript==
    `)).toEqual(EXTRACT_RESULT_EMPTY);
});

it("a typical block is properly extracted, parsed and validated", () => {
    expect(readAndValidate(TYPICAL_USERSCRIPT)).toEqual(READ_AND_VALIDATE_RESULT_TYPICAL);
});

it("no comments is caught", () => {
    expect(extractBlock(`
        "use strict";
    `)).toEqual(EXTRACT_RESULT_NO_COMMENTS);
});

it("no start tag is caught", () => {
    expect(extractBlock(`
        // ==/UserScript==
    `)).toEqual(EXTRACT_RESULT_NO_START_TAG);
});

it("no end tag is caught", () => {
    expect(extractBlock(`
        // ==UserScript==
    `)).toEqual(EXTRACT_RESULT_NO_END_TAG);
});

it("end tag before start tag is caught", () => {
    expect(extractBlock(`
        // ==/UserScript==
        // ==UserScript==
    `)).toEqual(EXTRACT_RESULT_END_TAG_BEFORE_START_TAG);
});
