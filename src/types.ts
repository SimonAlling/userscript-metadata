import { ItemCollection } from "./item";

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

export interface Warning {
    summary: string
    description: string
}

export type WarningsGenerator = (entries: Entries) => ReadonlyArray<Warning>

export type Metadata = { readonly [key: string]: Value }

export interface ValidateEntriesOptions {
    items?: ItemCollection
    warnings?: WarningsGenerator
}

export type ValidateOptions = ValidateEntriesOptions & {
    underscoresAsHyphens?: boolean
}

export interface StringifyOptions {
    align?: boolean
    minify?: boolean
    spacing?: number
    underscoresAsHyphens?: boolean
}

export type Options = StringifyOptions & ValidateOptions

// Maybe
export type Just<T> = { Just: T }
export type Nothing = {}
export type Maybe<T> = Just<T> | Nothing
export const Nothing: Nothing = {};
export function Just<T>(x: T): Just<T> { return { Just: x }; }
export function isJust<T>(x: Maybe<T>): x is Just<T> { return "Just" in x; }

// Either
export type Left<L> = { Left: L }
export type Right<R> = { Right: R }
export type Either<L, R> = Left<L> | Right<R>
export function Left<L>(x: L): Left<L> { return { Left: x }; }
export function Right<R>(x: R): Right<R> { return { Right: x }; }
export function isLeft<L, R>(x: Either<L, R>): x is Left<L> { return "Left" in x; }
export function isRight<L, R>(x: Either<L, R>): x is Right<R> { return "Right" in x; }
export function fromEither<L, R, Y>(
    fl: (l: L) => Y,
    fr: (r: R) => Y,
    x: Either<L, R>,
): Y {
    return isLeft(x) ? fl(x.Left) : fr(x.Right);
}
export function mapEither<L, X, Y>(f: (x: X) => Y, e: Either<L, X>): Either<L, Y> {
    return isLeft(e) ? Left(e.Left) : Right(f(e.Right));
}
