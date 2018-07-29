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
        const validationResult = validateEntriesWith(options)(parseResult.Right);
        if (isLeft(validationResult)) {
            return Left({
                failure: RF.VALIDATE,
                errors: validationResult.Left,
            } as ReadFailure);
        }
        const underscoresAsHyphens = fromMaybeUndefined(UNDERSCORES_AS_HYPHENS_DEFAULT, options.underscoresAsHyphens);
        const metadata = fromEntries(validationResult.Right.validated, underscoresAsHyphens);
        const warnings = validationResult.Right.warnings;
        return Right({ metadata, warnings });
    };
}
