import { r } from "../src/common";
import { stringify } from "../src/index";
import {
    METADATA_EMPTY,
    METADATA_BASIC_WITH_NOFRAMES,
} from "./valid-example-metadata";

const STRINGIFIED_EMPTY = r`
// ==UserScript==
// ==/UserScript==
`.trim();

const STRINGIFIED_DEFAULT = r`
// ==UserScript==
// @name      Example Userscript
// @version   1.0.0
// @noframes
// ==/UserScript==
`.trim();

const STRINGIFIED_3 = r`
// ==UserScript==
// @name   Example Userscript
// @version   1.0.0
// @noframes
// ==/UserScript==
`.trim();

const STRINGIFIED_3_ALIGN = r`
// ==UserScript==
// @name       Example Userscript
// @version    1.0.0
// @noframes
// ==/UserScript==
`.trim();

const STRINGIFIED_0 = r`
// ==UserScript==
// @name Example Userscript
// @version 1.0.0
// @noframes
// ==/UserScript==
`.trim();

const STRINGIFIED_0_ALIGN = r`
// ==UserScript==
// @name     Example Userscript
// @version  1.0.0
// @noframes
// ==/UserScript==
`.trim();

const STRINGIFIED_MINIFY = r`
//==UserScript==
//@name Example Userscript
//@version 1.0.0
//@noframes
//==/UserScript==
`.trim();

it("empty metadata is correctly stringified", () => {
    expect(stringify(METADATA_EMPTY)).toBe(STRINGIFIED_EMPTY);
});

it("metadata is correctly stringified with no options", () => {
    expect(stringify(METADATA_BASIC_WITH_NOFRAMES)).toBe(STRINGIFIED_DEFAULT);
});

it("metadata is correctly stringified with spacing: 3", () => {
    expect(stringify(METADATA_BASIC_WITH_NOFRAMES, { spacing: 3 })).toBe(STRINGIFIED_3_ALIGN);
    expect(stringify(METADATA_BASIC_WITH_NOFRAMES, { align: true, spacing: 3 })).toBe(STRINGIFIED_3_ALIGN);
    expect(stringify(METADATA_BASIC_WITH_NOFRAMES, { align: false, spacing: 3 })).toBe(STRINGIFIED_3);
});

it("metadata is correctly stringified with spacing: 0", () => {
    expect(stringify(METADATA_BASIC_WITH_NOFRAMES, { spacing: 0 })).toBe(STRINGIFIED_0_ALIGN);
    expect(stringify(METADATA_BASIC_WITH_NOFRAMES, { align: true, spacing: 0 })).toBe(STRINGIFIED_0_ALIGN);
    expect(stringify(METADATA_BASIC_WITH_NOFRAMES, { align: false, spacing: 0 })).toBe(STRINGIFIED_0);
});

it("metadata is correctly stringified with minify: true", () => {
    expect(stringify(METADATA_BASIC_WITH_NOFRAMES, { minify: true })).toBe(STRINGIFIED_MINIFY);
    expect(stringify(METADATA_BASIC_WITH_NOFRAMES, { align: true, minify: true, spacing: 10 })).toBe(STRINGIFIED_MINIFY);
    expect(stringify(METADATA_BASIC_WITH_NOFRAMES, { align: true, minify: true, spacing: 0 })).toBe(STRINGIFIED_MINIFY);
    expect(stringify(METADATA_BASIC_WITH_NOFRAMES, { align: false, minify: true, spacing: 0 })).toBe(STRINGIFIED_MINIFY);
});
