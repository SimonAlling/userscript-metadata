import { Left, Right } from "../src/types";
import { DEFAULT_ITEMS, Kind, StringItem } from "../src/index";
import { readAndValidate, validateAndStringify, validateAndStringifyWith } from "../src/index";
import {
    METADATA_TYPICAL,
    STRINGIFIED_TYPICAL,
} from "./valid-example-metadata";

it("typical metadata is correctly validated and stringified", () => {
    expect(validateAndStringify(METADATA_TYPICAL)).toEqual({ label: Right, content: STRINGIFIED_TYPICAL });
});

it("typical metadata is correctly read and validated", () => {
    expect(readAndValidate(STRINGIFIED_TYPICAL)).toEqual({ label: Right, content: METADATA_TYPICAL });
});

it("typical metadata is invalid without underscoresAsHyphens", () => {
    expect(validateAndStringifyWith(DEFAULT_ITEMS, {
        underscoresAsHyphens: false,
    })(METADATA_TYPICAL)).toEqual({ label: Left, content: [
        {
            kind: Kind.UNRECOGNIZED_KEY,
            entry: { key: "run_at", value: "document-start" },
        },
    ] });
});

it("typical metadata is invalid when @match is unique", () => {
    const ITEM_MATCH = new StringItem({
        key: "match",
        unique: true,
        required: false,
    });
    expect(validateAndStringifyWith(
        {
            ...DEFAULT_ITEMS,
            match: ITEM_MATCH,
        },
    )(METADATA_TYPICAL)).toEqual({ label: Left, content: [
        {
            kind: Kind.MULTIPLE_UNIQUE,
            item: ITEM_MATCH,
        },
    ] });
});
