export type Entry = {
    readonly key: string
    readonly value: SingleValue
}

export function isSingleValue(x: Value): x is SingleValue {
    return x === true || typeof x === "string";
}

export type SingleValue = true | string

export type Value = SingleValue | ReadonlyArray<SingleValue>

export type Entries = ReadonlyArray<Entry>

export type Metadata = { readonly [key: string]: Value }

export interface MetadataOptions {
    underscoresAsHyphens?: boolean
}

export interface EntriesOptions {
    align?: boolean
    minify?: boolean
    spacing?: number
}

export type Options = MetadataOptions & EntriesOptions

// Inspired by Haskell's Either.
// Left indicates failure; Right (as in correct) indicates success.
export type Either<A, B> = {
    readonly label: "Left"
    readonly content: A
} | {
    readonly label: "Right"
    readonly content: B
}

export const Left = "Left";
export const Right = "Right";
