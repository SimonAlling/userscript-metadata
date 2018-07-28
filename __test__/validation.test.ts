import {
    Kind, Metadata,
    isLeft, isRight, validate, validateWith,
} from "../src/index";
import {
    METADATA_EMPTY,
    METADATA_BASIC,
    METADATA_RUN_AT,
    METADATA_TYPICAL,
} from "./valid-example-metadata";
import {
    expectInvalidKey,
    expectInvalidValue,
} from "./helpers";

const ITEMS_EMPTY = {};
const METADATA_EMPTY_KEY: Metadata = {
    "name": "Example Userscript",
    "": "LOL",
};
const METADATA_WHITESPACE_IN_KEY: Metadata = {
    "name": "Example Userscript",
    "run at": "document-start",
};
const METADATA_MULTILINE_KEY: Metadata = {
    "name": "Example Userscript",
    "a\nb": "LOL",
};
const METADATA_WHITESPACE_ONLY_VALUE: Metadata = {
    "name": "   ",
};
const METADATA_MULTILINE_VALUE: Metadata = {
    "name": "Example\nUserscript",
};
const METADATA_INVALID_VERSION: Metadata = {
    "name": "Example Userscript",
    "version": "4.5.",
};
const METADATA_INVALID_MATCH: Metadata = {
    "name": "Example Userscript",
    "match": "LOL",
};
const METADATA_INVALID_RUN_AT: Metadata = {
    "name": "Example Userscript",
    "run-at": "document",
};
const METADATA_DUPLICATES: Metadata = {
    "name": "Example Userscript",
    "date": ["1970-01-01", "2012-12-21"],
};
const METADATA_MULTIPLE_ERRORS: Metadata = {
    "date": ["1970-01-01", "2012-12-21"], // duplicate unique
    "version": "1.0.", // invalid value
    "run-at": "document", // invalid value
    "match": [
        "*", // invalid value
        "example.com", // invalid value
    ],
    "require": " ", // whitespace-only value
    "": "Example Userscript", // empty key
};
const METADATA_INVALID_NOFRAMES: Metadata = {
    "name": "Example Userscript",
    "noframes": "LOL",
};


// Check that validation works:

it("empty metadata is valid with empty item list", () => {
    const result = validateWith({ items: ITEMS_EMPTY })(METADATA_EMPTY);
    expect(isRight(result)).toEqual(true);
});

it("empty metadata is invalid with default item list", () => {
    const result = validate(METADATA_EMPTY);
    expect(isLeft(result)).toEqual(true);
});

it("basic metadata is valid and has expected warnings with default item list", () => {
    const result = validate(METADATA_BASIC);
    expect(isRight(result)).toEqual(true);
});

it("basic metadata is invalid with empty item list", () => {
    const result = validateWith({ items: ITEMS_EMPTY })(METADATA_BASIC);
    expect(isLeft(result)).toEqual(true);
});

it("validation returns the same metadata", () => {
    const result = validate(METADATA_BASIC);
    if (isRight(result)) {
        expect(result.Right.validated).toBe(METADATA_BASIC);
    }
});

it("typical metadata is valid", () => {
    const result = validate(METADATA_TYPICAL);
    expect(isRight(result)).toEqual(true);
});

it("metadata with a valid @run-at value is valid", () => {
    const result = validate(METADATA_RUN_AT);
    expect(isRight(result)).toEqual(true);
});


// Check that invalid entries are caught:

it("an empty key is caught", () => {
    expectInvalidKey(METADATA_EMPTY_KEY, "empty");
});

it("a key with whitespace is caught", () => {
    expectInvalidKey(METADATA_WHITESPACE_IN_KEY, "space");
});

it("a key containing line breaks is caught", () => {
    expectInvalidKey(METADATA_MULTILINE_KEY, "space");
});

it("an empty or whitespace-only value is caught", () => {
    expectInvalidValue(METADATA_WHITESPACE_ONLY_VALUE, "whitespace");
});

it("a value containing line breaks is caught", () => {
    expectInvalidValue(METADATA_MULTILINE_VALUE, "break");
});

it("an invalid @version value is caught", () => {
    expectInvalidValue(METADATA_INVALID_VERSION, "version");
});

it("an invalid @match value is caught", () => {
    expectInvalidValue(METADATA_INVALID_MATCH, "@match");
});

it("an invalid @run-at value is caught", () => {
    expectInvalidValue(METADATA_INVALID_RUN_AT, "document");
});

it("an invalid @noframes value is caught", () => {
    expectInvalidValue(METADATA_INVALID_NOFRAMES, "true");
});

it("multiple entries for unique items are caught", () => {
    const result = validate(METADATA_DUPLICATES);
    expect(isLeft(result)).toEqual(true);
    if (isLeft(result)) {
        const errors = result.Left;
        expect(errors.length).toBe(1);
        expect(errors[0].kind).toBe(Kind.MULTIPLE_UNIQUE);
    }
});

it("multiple errors are caught", () => {
    const result = validate(METADATA_MULTIPLE_ERRORS);
    expect(isLeft(result)).toEqual(true);
    if (isLeft(result)) {
        const errors = result.Left;
        expect(errors.length).toBeGreaterThan(5);
    }
});
