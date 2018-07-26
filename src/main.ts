import { ItemCollection } from "./item";
import { DEFAULT_ITEMS } from "./data";
import { fromMaybe } from "./common";
import { fromEntries } from "./conversion";
import { Either, Left, Metadata, MetadataOptions, Options, Right } from "./types";
import { stringify } from "./stringify";
import { ExtractionError, extractBlock, parseBlock } from "./read";
import { validateEntriesWith, validateWith, ValidationError, UNDERSCORES_AS_HYPHENS_DEFAULT } from "./validation";

export type StringifyResult = Either<ReadonlyArray<ValidationError>, string>

export const enum ReadFailure {
    EXTRACT,
    PARSE,
    VALIDATE,
}

export type ReadResult = Either<{
    readonly failure: ReadFailure.EXTRACT
    readonly reason: ExtractionError
} | {
    readonly failure: ReadFailure.PARSE
    readonly lines: ReadonlyArray<string>
} | {
    readonly failure: ReadFailure.VALIDATE
    readonly errors: ReadonlyArray<ValidationError>
}, Metadata>

export const validateAndStringify = validateAndStringifyWith(DEFAULT_ITEMS);

export function validateAndStringifyWith(items: ItemCollection, options?: Options) {
    return (metadata: Metadata): StringifyResult => {
        const validationResult = validateWith(items, options)(metadata);
        if (validationResult.label === Left) {
            return { label: Left, content: validationResult.content };
        }
        return { label: Right, content: stringify(validationResult.content, ) };
    };
}

export const readAndValidate = readAndValidateWith(DEFAULT_ITEMS);

export function readAndValidateWith(items: ItemCollection, options: MetadataOptions = {}) {
    return (userscript: string): ReadResult => {
        const extractResult = extractBlock(userscript);
        if (extractResult.label === Left) {
            return { label: Left, content: {
                failure: ReadFailure.EXTRACT,
                reason: extractResult.content,
            } };
        }
        const parseResult = parseBlock(extractResult.content);
        if (parseResult.label === Left) {
            return { label: Left, content: {
                failure: ReadFailure.PARSE,
                lines: parseResult.content,
            } };
        }
        const validationResult = validateEntriesWith(items)(parseResult.content);
        if (validationResult.label === Left) {
            return { label: Left, content: {
                failure: ReadFailure.VALIDATE,
                errors: validationResult.content,
            } };
        }
        const underscoresAsHyphens = fromMaybe(UNDERSCORES_AS_HYPHENS_DEFAULT, options.underscoresAsHyphens);
        const metadata = fromEntries(validationResult.content, underscoresAsHyphens);
        return { label: Right, content: metadata };
    };
}
