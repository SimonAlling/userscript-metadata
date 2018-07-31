# ts-userscript-metadata

A strongly typed library for handling userscript metadata.


## Installation

```
npm install --save typescript ts-userscript-metadata
```

## Usage

### Validate and Stringify

This example demonstrates how metadata can be defined, validated and stringified:

```typescript
import {
    Kind, Metadata, ValidationError,
    isRight, validateAndStringify,
} from "ts-userscript-metadata";

const metadata: Metadata = {
    name: "Example Userscript",
    version: "1.0.0",
    match: [
        `*://example.com/*`,
        `*://www.example.com/*`,
    ],
    run_at: "document-start",
    noframes: true,
};

function stringifyError(error: ValidationError): string {
    switch (error.kind) {
        case Kind.INVALID_KEY: return `Invalid key: "${error.entry.key}". ${error.reason}`;
        case Kind.INVALID_VALUE: return `Invalid @${error.entry.key} value: ${JSON.stringify(error.entry.value)}. ${error.reason}`;
        case Kind.MULTIPLE_UNIQUE: return `Multiple @${error.item.key} values. Only one value is allowed.`;
        case Kind.REQUIRED_MISSING: return `A @${error.item.key} entry is required, but none was found.`;
        case Kind.UNRECOGNIZED_KEY: return `Unrecognized key: "${error.entry.key}".`;
        default: throw new Error("Unknown metadata error.");
    }
}

const result = validateAndStringify(metadata);
if (isRight(result)) {
    console.log(result.Right.stringified);
    result.Right.warnings.forEach(warning => {
        console.warn(warning.summary);
        console.warn(warning.description);
    });
} else {
    result.Left.forEach(error => {
        console.error(stringifyError(error));
    })
}
```

The code above will log the following:

```
// ==UserScript==
// @name      Example Userscript
// @version   1.0.0
// @match     *://example.com/*
// @match     *://www.example.com/*
// @run-at    document-start
// @noframes
// ==/UserScript==
```


### Read and Validate

Assuming the same definition of `stringifyError` as above, this is how metadata can be read from a userscript:

```typescript
import {
    Kind, ValidationError, ReadFailure, ReadFailureType,
    isRight, readAndValidate,
} from "ts-userscript-metadata";

const userscript: string = `
// ==UserScript==
// @name      Example Userscript
// @version   1.0.0
// @match     *://example.com/*
// @match     *://www.example.com/*
// @run-at    document-start
// @noframes
// ==/UserScript==

console.log("Hello world!");
`;

function stringifyFailure(failure: ReadFailure): string {
    switch (failure.type) {
        case ReadFailureType.EXTRACT: return `Could not extract metadata block. Reason: ${failure.reason}`;
        case ReadFailureType.PARSE: return `Could not parse these lines in the metadata block:\n\n${failure.lines.join("\n")}`;
        case ReadFailureType.VALIDATE: return `Invalid metadata. Errors:\n\n${failure.errors.map(stringifyError).join("\n")}`;
        default: throw new Error("Unknown metadata read failure.");
    }
}

const result = readAndValidate(userscript);
if (isRight(result)) {
    console.log(result.Right.metadata);
    result.Right.warnings.forEach(warning => {
        console.warn(warning.summary);
        console.warn(warning.description);
    });
} else {
    console.error(stringifyFailure(result.Left));
}
```

The code above will log this:

```javascript
{ name: 'Example Userscript',
  version: '1.0.0',
  match: [ '*://example.com/*', '*://www.example.com/*' ],
  run_at: 'document-start',
  noframes: true }
```

I.e. a value of type `Metadata`, identical to the one we gave as an argument to `validateAndStringify` before.


### Errors and Warnings

The demos above contain nothing that would yield any errors or warnings, but they contain code for handling them.
Try for example removing the `@name` entry to yield an error, or remove the `@match` entry to yield a warning.


### Customization

You can customize metadata validation by using the more powerful higher-order functions `validateAndStringifyWith` and `readAndValidateWith`.
If you call them with an options object, you get back customized versions of `validateAndStringify` and `readAndValidate`, respectively:

```typescript
import {
    StringItem, validateAndStringifyWith, DEFAULT_ITEMS, DEFAULT_WARNINGS,
} from "ts-userscript-metadata";

const validateAndStringify_custom = validateAndStringifyWith({
    items: {
        ...DEFAULT_ITEMS, // to keep default items
        name: DEFAULT_ITEMS.name.butNotRequired(),
        version: DEFAULT_ITEMS.version.withoutConstraints().butRequired(),
        foo: new StringItem({
            key: "foo",
            required: false,
            unique: true,
        }),
        useful: new BooleanItem({
            key: "useful",
        }),
    },
    warnings: DEFAULT_WARNINGS.concat([ // to keep default warnings
        entries => (
            !entries.some(entry => entry.key === "foo")
            ? [ {
                summary: `No @foo entry.`,
                description: `A @foo entry is recommended.`,
            } ]
            : []
        ),
    ]),
});

const result = validateAndStringify_custom(metadata);
// ...
```

The example above demonstrates several customizations:

  * The `name` item is not required anymore.
  * The `version` item has been deprived of its default constraints and is now required.
  * Two custom items, `foo` and `useful`, have been added.
  * Another warning has been added to the default ones.

Both `items` and `warnings` are optional; if not specified, they default to `DEFAULT_ITEMS` and `DEFAULT_WARNINGS`, respectively.
(In fact, `validateAndStringify` is defined as `validateAndStringifyWith()` in the actual code.)
