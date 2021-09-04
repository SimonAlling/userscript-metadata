import { isValidConnectValue } from "../src/connect";
import * as P from "../src/patterns";
import { r } from "../src/common";
import {
    testMapping, testSoundness, testCompleteness,
} from "./helpers";

it("isValidConnectValue is sound", () => {
    testSoundness(isValidConnectValue, [
        "",
        "lol",
        "1.1.1",
        "1.1.1.1.",
        "*example.com",
        "*.example.com",
        "http://example.com",
    ]);
});

it("isValidConnectValue is complete", () => {
    testCompleteness(isValidConnectValue, [
        "*",
        "self",
        "localhost",
        "example.com",
        "www.example.com",
        "1.2.3.4",
        "127.0.0.1",
        "2001:db8:3333:4444:5555:6666:7777:8888",
    ]);
});

it("regexFromIncludePattern works for simple include patterns", () => {
    testMapping(x => P.regexFromIncludePattern(x).source, [
        { x: r`*`, y: r`^.*$` },
        { x: r`*example.com`, y: r`^.*example\.com$` },
        { x: r`*://example.com/*`, y: r`^.*:\/\/example\.com\/.*$` },
        { x: r`http://example.com/*`, y: r`^http:\/\/example\.com\/.*$` },
    ]);
});

it("regexFromIncludePattern works for regexes", () => {
    testMapping(x => P.regexFromIncludePattern(x).source, [
        { x: r`/^https?://example\.com/.*$/`, y: r`^https?:\/\/example\.com\/.*$` },
        { x: r`/example\.com/`, y: r`example\.com` },
        { x: r`/.*/`, y: r`.*` },
        { x: r`/^.*$/`, y: r`^.*$` },
    ]);
});

it("normalizeMatchPattern works", () => {
    testMapping(P.normalizeMatchPattern, [
        { x: "<all_urls>", y: "*://*/*" },
        { x: "*://*/*", y: "*://*/*" },
        { x: "*://example.com/*", y: "*://example.com/*" },
    ]);
});

it("isMatchPattern is sound", () => {
    testSoundness(P.isMatchPattern, [
        "",
        "*",
        "*://*",
        "example.com",
        "*://example.com",
        "*://*example.com/*",
        "example.com",
    ]);
});

it("isMatchPattern is complete", () => {
    testCompleteness(P.isMatchPattern, [
        "<all_urls>",
        "*://*/*",
        "*://example.com/*",
        "*://*.example.com/*",
        "http://example.com/*",
        "https://example.com/*",
        "https://example.com/index.html",
    ]);
});

it("isIncludePattern_regex is sound", () => {
    testSoundness(P.isIncludePattern_regex, [
        "",
        "//",
        "*",
        "*://example.com/*",
    ]);
});

it("isIncludePattern_regex is complete", () => {
    testCompleteness(P.isIncludePattern_regex, [
        "/.*/",
        "/example/",
        "/https?://example.com/.+/",
    ]);
});

it("schemeIn works", () => {
    testMapping(P.schemeIn, [
        { x: "<all_urls>", y: "*" },
        { x: "*://*/*", y: "*" },
        { x: "*://example.com/*", y: "*" },
        { x: "http://example.com/*", y: "http" },
        { x: "https://example.com/*", y: "https" },
    ]);
});

it("hostIn works", () => {
    testMapping(P.hostIn, [
        { x: "<all_urls>", y: "*" },
        { x: "*://*/*", y: "*" },
        { x: "*://example.com/*", y: "example.com" },
        { x: "http://example.com/", y: "example.com" },
        { x: "https://*.example.com/*", y: "*.example.com" },
        { x: "https://www.example.com/*", y: "www.example.com" },
        { x: "https://*.cdn.example.com/*", y: "*.cdn.example.com" },
    ]);
});

it("pathIn works", () => {
    testMapping(P.pathIn, [
        { x: "<all_urls>", y: "/*" },
        { x: "*://example.com/*", y: "/*" },
        { x: "http://example.com/", y: "/" },
        { x: "http://example.com/*", y: "/*" },
        { x: "http://example.com/index.html", y: "/index.html" },
        { x: "http://example.com/foo*bar", y: "/foo*bar" },
        { x: "http://example.com/*.html", y: "/*.html" },
    ]);
});
