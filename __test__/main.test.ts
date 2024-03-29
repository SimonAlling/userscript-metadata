import { Left, Right } from "../src/types";
import { DEFAULT_ITEMS, Kind } from "../src/index";
import * as Msg from "../src/messages";
import { readAndValidate, validateAndStringify, validateAndStringifyWith } from "../src/index";
import {
    METADATA_TYPICAL,
    STRINGIFIED_TYPICAL,
} from "./valid-example-metadata";

it("typical metadata is correctly validated and stringified", () => {
    expect(validateAndStringify(METADATA_TYPICAL)).toEqual(Right({ stringified: STRINGIFIED_TYPICAL, warnings: expect.anything() }));
});

it("typical metadata is correctly read and validated", () => {
    expect(readAndValidate(STRINGIFIED_TYPICAL)).toEqual(Right({ metadata: METADATA_TYPICAL, warnings: expect.anything() }));
});

it("typical metadata is invalid without underscoresAsHyphens", () => {
    expect(validateAndStringifyWith({
        underscoresAsHyphens: false,
    })(METADATA_TYPICAL)).toEqual(Left([
        {
            kind: Kind.UNRECOGNIZED_KEY,
            entry: { key: "run_at", value: "document-start" },
        },
    ]));
});

it("typical metadata is invalid when @match is unique", () => {
    const ITEM_MATCH = DEFAULT_ITEMS.match.butUnique();
    expect(validateAndStringifyWith({ items:
        {
            ...DEFAULT_ITEMS,
            match: ITEM_MATCH,
        },
    })(METADATA_TYPICAL)).toEqual(Left([
        {
            kind: Kind.MULTIPLE_UNIQUE,
            item: ITEM_MATCH,
        },
    ]));
});

it("typical metadata is invalid when description is required", () => {
    const ITEM_DESCRIPTION = DEFAULT_ITEMS.description.butRequired();
    expect(validateAndStringifyWith({ items:
        {
            ...DEFAULT_ITEMS,
            description: ITEM_DESCRIPTION,
        },
    })(METADATA_TYPICAL)).toEqual(Left([
        {
            kind: Kind.REQUIRED_MISSING,
            item: ITEM_DESCRIPTION,
        },
    ]));
});

it("typical metadata is invalid when name cannot contain whitespace", () => {
    const ITEM_NAME = DEFAULT_ITEMS.name.withConstraints([
        {
            requirement: s => !(/\s/.test(s)),
            message: Msg.whitespaceNotAllowed,
        },
    ]);
    expect(validateAndStringifyWith({ items:
        {
            ...DEFAULT_ITEMS,
            name: ITEM_NAME,
        },
    })(METADATA_TYPICAL)).toEqual(Left([
        {
            kind: Kind.INVALID_VALUE,
            entry: { key: "name", value: "Example Userscript" },
            reason: Msg.whitespaceNotAllowed,
        },
    ]));
});

it("typical metadata with non-semver version is valid when version has no constraints", () => {
    const ITEM_VERSION = DEFAULT_ITEMS.version.withoutConstraints();
    const METADATA_WITH_WEIRD_VERSION = { ...METADATA_TYPICAL, version: "Beta" };
    expect(validateAndStringifyWith({ items:
        {
            ...DEFAULT_ITEMS,
            version: ITEM_VERSION,
        },
    })(METADATA_WITH_WEIRD_VERSION)).toEqual(Right({
        stringified: STRINGIFIED_TYPICAL.replace(METADATA_TYPICAL.version, "Beta"),
        warnings: [],
    }));
});
