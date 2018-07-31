import { fromMaybeUndefined } from "./common";
import { fromEntries } from "./conversion";
import { Either, Left, Metadata, Options, Right, ValidateOptions, Warning, isLeft, mapEither } from "./types";
import { stringify } from "./stringify";
import { ExtractionError, extractBlock, parseBlock } from "./read";
import { validateEntriesWith, validateWith, ValidationError, UNDERSCORES_AS_HYPHENS_DEFAULT } from "./validation";

export type StringifyResult = Either<
    ReadonlyArray<ValidationError>,
    {
        stringified: string
        warnings: ReadonlyArray<Warning>
    }
>

export type ReadResult = Either<
    ReadFailure,
    {
        metadata: Metadata
        warnings: ReadonlyArray<Warning>
    }
>

export const enum ReadFailureType {
    EXTRACT = "EXTRACT",
    PARSE = "PARSE",
    VALIDATE = "VALIDATE",
}

export type ReadFailure = {
    readonly type: ReadFailureType.EXTRACT
    readonly reason: ExtractionError
} | {
    readonly type: ReadFailureType.PARSE
    readonly lines: ReadonlyArray<string>
} | {
    readonly type: ReadFailureType.VALIDATE
    readonly errors: ReadonlyArray<ValidationError>
};

export const validateAndStringify = validateAndStringifyWith();

export function validateAndStringifyWith(options?: Options) {
    return (metadata: Metadata): StringifyResult => {
        const validationResult = validateWith(options)(metadata);
        return mapEither(
            x => ({
                stringified: stringify(x.validated, options),
                warnings: x.warnings,
            }),
            validationResult,
        );
    };
}

export const readAndValidate = readAndValidateWith();

export function readAndValidateWith(options: ValidateOptions = {}) {
    return (userscript: string): ReadResult => {
        const extractResult = extractBlock(userscript);
        if (isLeft(extractResult)) {
            return Left({
                type: ReadFailureType.EXTRACT,
                reason: extractResult.Left,
            } as ReadFailure);
        }
        const parseResult = parseBlock(extractResult.Right);
        if (isLeft(parseResult)) {
            return Left({
                type: ReadFailureType.PARSE,
                lines: parseResult.Left,
            } as ReadFailure);
        }
        const validationResult = validateEntriesWith(options)(parseResult.Right);
        if (isLeft(validationResult)) {
            return Left({
                type: ReadFailureType.VALIDATE,
                errors: validationResult.Left,
            } as ReadFailure);
        }
        const underscoresAsHyphens = fromMaybeUndefined(UNDERSCORES_AS_HYPHENS_DEFAULT, options.underscoresAsHyphens);
        const metadata = fromEntries(validationResult.Right.validated, underscoresAsHyphens);
        const warnings = validationResult.Right.warnings;
        return Right({ metadata, warnings });
    };
}
