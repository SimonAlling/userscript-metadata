import { r } from "../src/common";
import { Metadata } from "../src/index";

export const METADATA_EMPTY: Metadata = {};

export const METADATA_BASIC: Metadata = {
    "name": "Example Userscript",
    "version": "1.0.0",
};

export const METADATA_BASIC_WITH_NOFRAMES: Metadata = {
    "name": "Example Userscript",
    "version": "1.0.0",
    "noframes": true,
};

export const METADATA_RUN_AT: Metadata = {
    "name": "Example Userscript",
    "run-at": "document-start",
};

export const METADATA_TYPICAL: Metadata = {
    name: "Example Userscript",
    version: "1.0.0",
    noframes: true,
    run_at: "document-start",
    match: [
        "*://*.example.com/*",
        "*://*.github.com/*",
    ],
}

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
