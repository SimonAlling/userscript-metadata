import { Kind, Metadata, validate, isLeft } from "../src/index";

export function show(xs: string[]): string {
    return xs.join(", ");
}

function expectInvalid(kind: Kind.INVALID_KEY | Kind.INVALID_VALUE) {
    return (metadata: Metadata, reasonSubstring: string): void => {
        const result = validate(metadata);
        expect(isLeft(result)).toBe(true);
        if (isLeft(result)) {
            const errors = result.Left;
            expect(errors.length).toBe(1);
            const firstError = errors[0];
            expect(firstError.kind).toBe(kind);
            if (firstError.kind === kind) {
                expect(firstError.reason).toContain(reasonSubstring);
            }
        }
    };
}

export const expectInvalidKey = expectInvalid(Kind.INVALID_KEY);
export const expectInvalidValue = expectInvalid(Kind.INVALID_VALUE);

export function testMapping<X, Y>(f: (x: X) => Y, expectedMappings: ReadonlyArray<{ x: X, y: Y }>): void {
    expectedMappings.forEach(mapping => {
        expect(f(mapping.x)).toBe(mapping.y);
    });
}

function predicateTester<T>(expected: boolean): (f: (x: T) => boolean, xs: ReadonlyArray<T>) => void {
    return (f, xs) => {
        xs.forEach(x => {
            expect(f(x)).toBe(expected);
        });
    };
}

export const testSoundness = predicateTester(false);
export const testCompleteness = predicateTester(true);
