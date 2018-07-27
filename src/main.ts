import { ItemCollection } from "./item";
import { DEFAULT_ITEMS } from "./data";
import { fromMaybeUndefined } from "./common";
import { fromEntries } from "./conversion";
import { Either, Left, Metadata, MetadataOptions, Options, Right, isLeft, mapEither } from "./types";
import { stringify } from "./stringify";
import { ExtractionError, extractBlock, parseBlock } from "./read";
import { validateEntriesWith, validateWith, ValidationError, UNDERSCORES_AS_HYPHENS_DEFAULT } from "./validation";

export type StringifyResult = Either<ReadonlyArray<ValidationError>, string>

export const enum RF {
    EXTRACT,
    PARSE,
    VALIDATE,
}

export type ReadFailure = {
    readonly failure: RF.EXTRACT
    readonly reason: ExtractionError
} | {
    readonly failure: RF.PARSE
    readonly lines: ReadonlyArray<string>
} | {
    readonly failure: RF.VALIDATE
    readonly errors: ReadonlyArray<ValidationError>
};

export type ReadResult = Either<ReadFailure, Metadata>

export const validateAndStringify = validateAndStringifyWith(DEFAULT_ITEMS);

export function validateAndStringifyWith(items: ItemCollection, options?: Options) {
    return (metadata: Metadata): StringifyResult => {
        const validationResult = validateWith(items, options)(metadata);
        return mapEither(x => stringify(x, options), validationResult);
    };
}

export const readAndValidate = readAndValidateWith(DEFAULT_ITEMS);

export function readAndValidateWith(items: ItemCollection, options: MetadataOptions = {}) {
    return (userscript: string): ReadResult => {
        const extractResult = extractBlock(userscript);
        if (isLeft(extractResult)) {
            return Left({
                failure: RF.EXTRACT,
                reason: extractResult.Left,
            } as ReadFailure);
        }
        const parseResult = parseBlock(extractResult.Right);
        if (isLeft(parseResult)) {
            return Left({
                failure: RF.PARSE,
                lines: parseResult.Left,
            } as ReadFailure);
        }
        const validationResult = validateEntriesWith(items)(parseResult.Right);
        if (isLeft(validationResult)) {
            return Left({
                failure: RF.VALIDATE,
                errors: validationResult.Left,
            } as ReadFailure);
        }
        const underscoresAsHyphens = fromMaybeUndefined(UNDERSCORES_AS_HYPHENS_DEFAULT, options.underscoresAsHyphens);
        const metadata = fromEntries(validationResult.Right, underscoresAsHyphens);
        return Right(metadata);
    };
}
