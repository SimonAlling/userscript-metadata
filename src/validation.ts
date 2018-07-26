import { Either, Entry, Left, Metadata, MetadataOptions, Right } from "./types";
import { fromMaybe } from "./common";
import { Item, ItemCollection } from "./item";
import { toEntries } from "./conversion";
import { DEFAULT_ITEMS } from "./data";
import { KEY_RULES } from "./key";

export const UNDERSCORES_AS_HYPHENS_DEFAULT = true;

export type ValidationResult<T> = Either<ReadonlyArray<ValidationError>, T>

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

function validateKey(key: string): Either<string, string> {
    for (const rule of KEY_RULES) {
        if (!rule.requirement(key)) {
            return { label: Left, content: rule.message };
        }
    }
    return { label: Right, content: key };
}

export const validateEntries = validateEntriesWith(DEFAULT_ITEMS);

export function validateEntriesWith(items: ItemCollection) {
    return (entries: ReadonlyArray<Entry>): ValidationResult<ReadonlyArray<Entry>> => {
        const itemList = Object.values(items);
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
            if (keyValidation.label === Left) {
                errors.push({ entry, kind: Kind.INVALID_KEY, reason: keyValidation.content });
            } else {
                // Key format is valid (but key may be unrecognized).
                const item: Item | undefined = itemList.find(i => i.key === entry.key);
                if (item === undefined) {
                    errors.push({ entry, kind: Kind.UNRECOGNIZED_KEY });
                } else {
                    const validation = item.validate(entry.value);
                    if (validation.label === Left) {
                        errors.push({ entry, kind: Kind.INVALID_VALUE, reason: validation.content });
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
            ? { label: Left, content: errors }
            : { label: Right, content: entries }
        );
    };
}

export const validate = validateWith(DEFAULT_ITEMS);

export function validateWith(items: ItemCollection, options: MetadataOptions = {}) {
    const underscoresAsHyphens = fromMaybe(UNDERSCORES_AS_HYPHENS_DEFAULT, options.underscoresAsHyphens);
    return (metadata: Metadata): ValidationResult<Metadata> => {
        const entries = toEntries(metadata, underscoresAsHyphens);
        const result = validateEntriesWith(items)(entries);
        return (
            result.label === Left
            ? { label: Left, content: result.content }
            : { label: Right, content: metadata }
        );
    };
}
