import { Either, Left, Right, Value } from "./types";
import {
    Constraint,
    not,
    containsLineBreaks,
    containsOnlyWhitespace,
    containsLeadingWhitespace,
    containsTrailingWhitespace,
} from "./common";
import * as Msg from "./messages";

export interface Constrained<T> {
    readonly constraints: ReadonlyArray<Constraint<T>>
}

export interface ItemDescription<T> {
    readonly key: string
    readonly required: boolean
    readonly constraints?: ReadonlyArray<Constraint<T>>
}

export interface ItemDescription_String extends ItemDescription<string> {
    readonly unique: boolean
}

export type ValueValidationResult<T> = Either<string, T>

export type Item = BaseItem<Value>

export type ItemCollection = { readonly [k: string]: Item }

export abstract class BaseItem<T extends Value> {
    public abstract validate(value: Value): ValueValidationResult<T>;
    public readonly key: string;
    public readonly required: boolean;
    public abstract readonly unique: boolean;
    constructor(description: ItemDescription<T>) {
        this.key = description.key;
        this.required = description.required;
    }
}

export class BooleanItem extends BaseItem<true> {
    public readonly unique = true;
    public validate(value: Value): ValueValidationResult<true> {
        return (
            value === true
            ? { label: Right, content: true }
            : { label: Left, content: Msg.onlyTrueAllowed }
        );
    }
}

export class StringItem extends BaseItem<string> implements Constrained<string> {
    public readonly unique: boolean;
    public readonly constraints: ReadonlyArray<Constraint<string>>;
    constructor(description: ItemDescription_String) {
        super(description);
        this.unique = description.unique;
        this.constraints = [
            {
                requirement: not(containsOnlyWhitespace),
                message: Msg.someNonWhitespaceRequired,
            },
            {
                requirement: not(containsLeadingWhitespace),
                message: Msg.leadingWhitespaceNotAllowed,
            },
            {
                requirement: not(containsTrailingWhitespace),
                message: Msg.trailingWhitespaceNotAllowed,
            },
            {
                requirement: not(containsLineBreaks),
                message: Msg.lineBreaksNotAllowed,
            },
        ].concat(
            description.constraints === undefined ? [] : description.constraints
        );
    }
    public validate(value: Value): ValueValidationResult<string> {
        if (typeof value !== "string") {
            return { label: Left, content: "Only strings allowed." };
        }
        for (const c of this.constraints) {
            if (!c.requirement(value)) {
                return { label: Left, content: c.message };
            }
        }
        return { label: Right, content: value };
    }
}
