export const START_TAG = "==UserScript==";
export const END_TAG = "==/UserScript==";
export const COMMENT_PREFIX = "//";
export const TAG_PREFIX = "@";
export function tag(name: string): string { return TAG_PREFIX + name; }
