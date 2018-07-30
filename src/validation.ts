import { Either, Entries, Entry, Left, Metadata, ValidateEntriesOptions, ValidateOptions, Right, Warning, WarningsGenerator, isLeft, mapEither } from "./types";
import { fromMaybeUndefined } from "./common";
import { Item } from "./item";
import { toEntries } from "./conversion";
import { DEFAULT_ITEMS, DEFAULT_WARNINGS } from "./data";
import { not, isEmpty, containsWhitespace } from "./common";
import { Constraint } from "./common";
import * as Msg from "./messages";

export const UNDERSCORES_AS_HYPHENS_DEFAULT = true;

export type ValidationResult<T> = Either<
    ReadonlyArray<ValidationError>,
    {
        warnings: ReadonlyArray<Warning>
        validated: T
    }
>

export const enum Kind {
    INVALID_KEY = "INVALID_KEY",
    INVALID_VALUE = "INVALID_VALUE",
    MULTIPLE_UNIQUE = "MULTIPLE_UNIQUE",
    REQUIRED_MISSING = "REQUIRED_MISSING",
    UNRECOGNIZED_KEY = "UNRECOGNIZED_KEY",
}

export type ValidationError = {
    readonly kind: Kind.INVALID_KEY
    readonly entry: Entry
    readonly reason: string
} | {
    readonly kind: Kind.INVALID_VALUE
    readonly entry: Entry
    readonly reason: string
} | {
    readonly kind: Kind.MULTIPLE_UNIQUE
    readonly item: Item
} | {
    readonly kind: Kind.REQUIRED_MISSING
    readonly item: Item
} | {
    readonly kind: Kind.UNRECOGNIZED_KEY
    readonly entry: Entry
}

const KEY_RULES: ReadonlyArray<Constraint<string>> = [
    {
        requirement: not(isEmpty),
        message: Msg.emptyStringNotAllowed,
    },
    {
        requirement: not(containsWhitespace),
        message: Msg.whitespaceNotAllowed,
    },
];

function validateKey(key: string): Either<string, string> {
    for (const rule of KEY_RULES) {
        if (!rule.requirement(key)) {
            return Left(rule.message);
        }
    }
    return Right(key);
}

export const validateEntries = validateEntriesWith();

export function validateEntriesWith(options: ValidateEntriesOptions = {}) {
    return (entries: Entries): ValidationResult<Entries> => {
        const itemList = Object.values(fromMaybeUndefined(DEFAULT_ITEMS, options.items));
        const requiredItems = itemList.filter(i => i.required);
        const duplicateItems: Item[] = [];
        const errors: ValidationError[] = [];
        // Check presence of required items:
        requiredItems.forEach(item => {
            if (entries.find(entry => entry.key === item.key) === undefined) {
                errors.push({ item, kind: Kind.REQUIRED_MISSING });
            }
        });
        // Check present entries:
        entries.forEach(entry => {
            // Validate key format first:
            const keyValidation = validateKey(entry.key);
            if (isLeft(keyValidation)) {
                if (!errors.some(e => e.kind === Kind.INVALID_KEY && e.entry.key === entry.key)) {
                    errors.push({ entry, kind: Kind.INVALID_KEY, reason: keyValidation.Left });
                }
            } else {
                // Key format is valid (but key may be unrecognized).
                const item: Item | undefined = itemList.find(i => i.key === entry.key);
                if (item === undefined) {
                    if (!errors.some(e => e.kind === Kind.UNRECOGNIZED_KEY && e.entry.key === entry.key)) {
                        errors.push({ entry, kind: Kind.UNRECOGNIZED_KEY });
                    }
                } else {
                    const validation = item.validate(entry.value);
                    if (isLeft(validation)) {
                        errors.push({ entry, kind: Kind.INVALID_VALUE, reason: validation.Left });
                    }
                    if (item.unique && entries.filter(e => e.key === entry.key).length > 1) {
                        duplicateItems.push(item);
                    }
                }
            }
        });
        duplicateItems
            .reduce( // to only mention each key once
                (reduced: Item[], current: Item) => (
                    reduced.includes(current) ? reduced : reduced.concat(current)
                ), []
            )
            .sort( // alphabetically
                (a, b) => a.key === b.key ? 0 : a.key < b.key ? -1 : 1
            )
            .forEach(item => {
                errors.push({ item, kind: Kind.MULTIPLE_UNIQUE });
            });
        return (
            errors.length > 0
            ? Left(errors)
            : Right({
                validated: entries,
                warnings: fromMaybeUndefined(DEFAULT_WARNINGS, options.warnings).reduce(
                    (acc: ReadonlyArray<Warning>, gen: WarningsGenerator) => acc.concat(gen(entries)),
                    [],
                ),
            })
        );
    };
}

export const validate = validateWith();

export function validateWith(options: ValidateOptions = {}) {
    const underscoresAsHyphens = fromMaybeUndefined(UNDERSCORES_AS_HYPHENS_DEFAULT, options.underscoresAsHyphens);
    return (metadata: Metadata): ValidationResult<Metadata> => {
        const entries = toEntries(metadata, underscoresAsHyphens);
        const result = validateEntriesWith(options)(entries);
        return mapEither(x => ({
            validated: metadata,
            warnings: x.warnings,
        }), result);
    };
}
