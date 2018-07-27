import { Either, Left, Right, Value } from "./types";
import { fromMaybeUndefined } from "./common";
import {
    Constraint,
    not,
    containsLineBreaks,
    containsOnlyWhitespace,
    containsLeadingWhitespace,
    containsTrailingWhitespace,
} from "./common";
import * as Msg from "./messages";

type Constraints<T> = ReadonlyArray<Constraint<T>>

export interface Constrained<T extends Value> {
    readonly constraints: Constraints<T>
    withConstraints(constraints: Constraints<T>): Constrained<T> & BaseItem<T>
    withoutConstraints(): Constrained<T> & BaseItem<T>
}

export interface Uniqueable<T extends Value> {
    readonly unique: boolean
    butUnique(): Uniqueable<T> & BaseItem<T>
    butNotUnique(): Uniqueable<T> & BaseItem<T>
}

export interface Requireable<T extends Value> {
    readonly required: boolean
    butRequired(): Requireable<T> & BaseItem<T>
    butNotRequired(): Requireable<T> & BaseItem<T>
}

export interface ItemDescription {
    readonly key: string
}

export interface NonBooleanItemDescription<T> extends ItemDescription {
    readonly required: boolean
    readonly unique: boolean
    readonly constraints?: ReadonlyArray<Constraint<T>>
}

export type ItemDescription_String = NonBooleanItemDescription<string>

export type ValueValidationResult<T> = Either<string, T>

export type Item = BaseItem<Value>

export type ItemCollection = { readonly [k: string]: Item }

export abstract class BaseItem<T extends Value> {
    public abstract validate(value: Value): ValueValidationResult<T>;
    public abstract readonly unique: boolean;
    public abstract readonly required: boolean;
    public readonly key: string;
    constructor(protected readonly description: ItemDescription) {
        this.key = description.key;
    }
}

export class BooleanItem extends BaseItem<true> {
    public readonly unique = true;
    public readonly required = false;
    public validate(value: Value): ValueValidationResult<true> {
        return (
            value === true
            ? Right(true)
            : Left(Msg.onlyTrueAllowed)
        ) as ValueValidationResult<true>;
    }
}

export abstract class NonBooleanItem<T extends Value> extends BaseItem<T> implements Constrained<T>, Uniqueable<T>, Requireable<T> {
    public readonly required: boolean;
    public readonly unique: boolean;
    public readonly constraints: ReadonlyArray<Constraint<T>>;
    constructor(protected readonly description: NonBooleanItemDescription<T>) {
        super(description);
        this.required = description.required;
        this.unique = description.unique;
        this.constraints = fromMaybeUndefined([], description.constraints);
    }
    public abstract butRequired(): NonBooleanItem<T>;
    public abstract butNotRequired(): NonBooleanItem<T>;
    public abstract butUnique(): NonBooleanItem<T>;
    public abstract butNotUnique(): NonBooleanItem<T>;
    public abstract withConstraints(constraints: Constraints<T>): NonBooleanItem<T>;
    public abstract withoutConstraints(): NonBooleanItem<T>;
}

export class StringItem extends NonBooleanItem<string> implements Constrained<string>, Uniqueable<string>, Requireable<string> {
    public readonly constraints: ReadonlyArray<Constraint<string>>;
    constructor(protected readonly description: ItemDescription_String) {
        super(description);
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
            fromMaybeUndefined([], description.constraints)
        );
    }

    public butRequired(): StringItem {
        return new StringItem({ ...this.description, required: true });
    }

    public butNotRequired(): StringItem {
        return new StringItem({ ...this.description, required: false });
    }

    public butUnique(): StringItem {
        return new StringItem({ ...this.description, unique: true });
    }

    public butNotUnique(): StringItem {
        return new StringItem({ ...this.description, unique: false });
    }

    public withConstraints(constraints: Constraints<string>): StringItem {
        return new StringItem({ ...this.description, constraints: this.constraints.concat(constraints) });
    }

    public withoutConstraints(): StringItem {
        return new StringItem({ ...this.description, constraints: [] });
    }

    public validate(value: Value): ValueValidationResult<string> {
        if (typeof value !== "string") {
            return Left("Only strings allowed.");
        }
        for (const c of this.constraints) {
            if (!c.requirement(value)) {
                return Left(c.message);
            }
        }
        return Right(value);
    }
}
