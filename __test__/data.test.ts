import {
    DEFAULT_ITEMS,
} from "../src/index";
import { KEY } from "../src/key";
import { replaceHyphens, replaceUnderscores } from "../src/common";
import { show } from "./helpers";

const objectKeys_KEY = Object.keys(KEY) as (keyof typeof KEY)[];
const objectKeys_KEY_sorted = Object.keys(KEY).sort() as (keyof typeof KEY)[];
const objectKeys_DEFAULT_ITEMS = Object.keys(DEFAULT_ITEMS) as (keyof typeof DEFAULT_ITEMS)[];

it("keys are sorted in KEY", () => {
    expect(show(objectKeys_KEY)).toBe(show(objectKeys_KEY_sorted));
});

it("keys and values match in KEY", () => {
    objectKeys_KEY.forEach(k => {
        expect(KEY[k]).toBe(replaceUnderscores(k));
        expect(k).toBe(replaceHyphens(KEY[k]));
    });
});

it("DEFAULT_ITEMS contains exactly the same keys as KEY", () => {
    objectKeys_KEY.forEach((k, i) => {
        expect(objectKeys_DEFAULT_ITEMS[i]).toBe(k);
    });
});

it("keys and values (.key) match in DEFAULT_ITEMS", () => {
    objectKeys_DEFAULT_ITEMS.forEach(k => {
        expect(DEFAULT_ITEMS[k].key).toBe(replaceUnderscores(k));
        expect(k).toBe(replaceHyphens(DEFAULT_ITEMS[k].key));
    });
});
