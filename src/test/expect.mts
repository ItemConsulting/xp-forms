import assert from "node:assert/strict";

/**
 * A minimal `expect()` backed by `node:assert`, covering exactly the matchers these tests use.
 * It keeps the suite off a test-framework dependency (we run on `node:test`) while leaving the
 * assertions readable. `toEqual` is deep + strict, so an expected `{ k: undefined }` must match an
 * own `k` set to `undefined` on the actual value.
 */
export function expect(actual: unknown) {
  return {
    toBe: (expected: unknown): void => assert.strictEqual(actual, expected),
    toEqual: (expected: unknown): void => assert.deepStrictEqual(actual, expected),
    toBeUndefined: (): void => assert.strictEqual(actual, undefined),
    toBeInstanceOf: (ctor: new (...args: never[]) => unknown): void => assert.ok(actual instanceof ctor),
    toBeGreaterThan: (expected: number): void => assert.ok((actual as number) > expected),
    /** With a `message`, the thrown error's message must contain it. */
    toThrow: (message?: string): void => {
      assert.throws(actual as () => unknown, (err: unknown) => {
        return message === undefined || String((err as Error).message).includes(message);
      });
    },
    not: {
      toThrow: (): void => assert.doesNotThrow(actual as () => unknown),
    },
  };
}
