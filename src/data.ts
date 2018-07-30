import {
    BooleanItem,
    StringItem,
} from "./item";
import { isMatchPattern, isIncludePattern_regex } from "./patterns";
import { KEY } from "./key";
import { Entries, Warning, WarningsGenerator } from "./types";
import * as Msg from "./messages";

export const DOCUMENT_END = "document-end";
export const DOCUMENT_IDLE = "document-idle";
export const DOCUMENT_START = "document-start";
export const RUN_AT_VALUES = [ DOCUMENT_END, DOCUMENT_IDLE, DOCUMENT_START ];

const SEMVER_REGEX = /^(\d+)(?:\.(\d+))*$/;

export const DEFAULT_ITEMS = {
    author: new StringItem({
        key: KEY.author,
        unique: true,
        required: false,
    }),
    date: new StringItem({
        key: KEY.date,
        unique: true,
        required: false,
    }),
    description: new StringItem({
        key: KEY.description,
        unique: true,
        required: false,
    }),
    downloadURL: new StringItem({
        key: KEY.downloadURL,
        unique: true,
        required: false,
    }),
    exclude: new StringItem({
        key: KEY.exclude,
        unique: false,
        required: false,
    }),
    grant: new StringItem({
        key: KEY.grant,
        unique: false,
        required: false,
    }),
    homepageURL: new StringItem({
        key: KEY.homepageURL,
        unique: true,
        required: false,
    }),
    icon: new StringItem({
        key: KEY.icon,
        unique: true,
        required: false,
    }),
    include: new StringItem({
        key: KEY.include,
        unique: false,
        required: false,
    }),
    license: new StringItem({
        key: KEY.license,
        unique: true,
        required: false,
    }),
    match: new StringItem({
        key: KEY.match,
        unique: false,
        required: false,
        constraints: [ {
            requirement: isMatchPattern,
            message: Msg.validMatchPatternRequired,
        } ],
    }),
    name: new StringItem({
        key: KEY.name,
        unique: true,
        required: true,
    }),
    namespace: new StringItem({
        key: KEY.namespace,
        unique: true,
        required: false,
    }),
    noframes: new BooleanItem({
        key: KEY.noframes,
    }),
    require: new StringItem({
        key: KEY.require,
        unique: false,
        required: false,
    }),
    resource: new StringItem({
        key: KEY.resource,
        unique: false,
        required: false,
    }),
    run_at: new StringItem({
        key: KEY.run_at,
        unique: true,
        required: false,
        constraints: [ {
            requirement: v => RUN_AT_VALUES.includes(v),
            message: `Value must be one of ${RUN_AT_VALUES.map(x => `"${x}"`).join(", ")}.`,
        } ],
    }),
    updateURL: new StringItem({
        key: KEY.updateURL,
        unique: true,
        required: false,
    }),
    version: new StringItem({
        key: KEY.version,
        unique: true,
        required: false,
        constraints: [ {
            requirement: v => SEMVER_REGEX.test(v),
            message: Msg.semanticVersionRequired,
        } ],
    }),
};

export const DEFAULT_WARNINGS: ReadonlyArray<WarningsGenerator> = [
    entries => (
        !entries.some(entry => [KEY.match, KEY.include].includes(entry.key))
        ? [ {
            summary: Msg.noMatchOrIncludeSummary,
            description: Msg.noMatchOrIncludeDescription,
        } ]
        : []
    ),
    entries => (
        entries.some(entry => entry.key === KEY.include && !isIncludePattern_regex(entry.value as string))
        ? [ {
            summary: Msg.matchInsteadOfIncludeSummary,
            description: Msg.matchInsteadOfIncludeDescription,
        } ]
        : []
    ),
];
