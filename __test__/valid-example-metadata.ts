import { r } from "../src/common";

export const METADATA_EMPTY = {} as const;

export const METADATA_BASIC = {
    "name": "Example Userscript",
    "version": "1.0.0",
} as const;

export const METADATA_BASIC_WITH_NOFRAMES = {
    "name": "Example Userscript",
    "version": "1.0.0",
    "noframes": true,
} as const;

export const METADATA_RUN_AT = {
    "name": "Example Userscript",
    "run-at": "document-start",
} as const;

export const METADATA_TYPICAL = {
    name: "Example Userscript",
    version: "1.0.0",
    noframes: true,
    run_at: "document-start",
    match: [
        "*://*.example.com/*",
        "*://*.github.com/*",
    ],
} as const;

export const STRINGIFIED_TYPICAL = r`
// ==UserScript==
// @name      Example Userscript
// @version   1.0.0
// @noframes
// @run-at    document-start
// @match     *://*.example.com/*
// @match     *://*.github.com/*
// ==/UserScript==
`.trim();
