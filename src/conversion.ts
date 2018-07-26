import { Entries, Entry, Metadata, SingleValue, isSingleValue } from "./types";
import { id, replaceHyphens, replaceUnderscores } from "./common";

export function toEntries(metadata: Metadata, underscoresAsHyphens: boolean): Entries {
    return Object.keys(metadata).reduce((entries: Entries, key: string) => {
        const value = metadata[key];
        const processedKey = (underscoresAsHyphens ? replaceUnderscores : id)(key);
        if (isSingleValue(value)) {
            return entries.concat({ key: processedKey, value });
        } else {
            return entries.concat(value.map(x => ({
                key: processedKey,
                value: x as SingleValue,
            })));
        }
    }, []);
}

export function fromEntries(entries: Entries, underscoresAsHyphens: boolean): Metadata {
    return entries.reduce((metadata: Metadata, entry: Entry) => {
        const key = (underscoresAsHyphens ? replaceHyphens : id)(entry.key);
        const old = metadata[key];
        const value = entry.value;
        const newValue = old === undefined ? value : isSingleValue(old) ? [old, value] : old.concat(value);
        return { ...metadata, [key]: newValue };
    }, {});
}
