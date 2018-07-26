import { not, isEmpty, containsWhitespace } from "./common";
import { Constraint } from "./common";
import * as Msg from "./messages";

export const KEY_RULES: ReadonlyArray<Constraint<string>> = [
    {
        requirement: not(isEmpty),
        message: Msg.emptyStringNotAllowed,
    },
    {
        requirement: not(containsWhitespace),
        message: Msg.whitespaceNotAllowed,
    },
];
