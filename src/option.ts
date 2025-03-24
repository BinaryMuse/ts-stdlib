/**
 *
 * ```typescript
 * import { Option, Some, None } from "@binarymuse/ts-stdlib"
 * ```
 *
 * > *(For a list of methods available on `Option<T>`, see {@link OptionMethods})*
 *
 * ## Overview
 *
 * An `Option<T>` is a value that represents the existance (or lack thereof) of another value. You can think of it a bit like `T | null` or `T | undefined`. While TypeScript can enforce checking to ensure you don't use a `null` or `undefined` value, `Option` provides some additional functionality that can make it a nice alternative.
 *
 * To create an `Option` wrapping some value of type `T` (written as `Option<T>`), use the `Some` function. For example: `const opt = Some(value)`. If you want to create an `Option` representing the lack of a value, use `None`. For example: `const missing = None`.
 *
 * To get to the wrapped value, call `unwrap()` on the `Option`. If the option is `None`, then `unwrap()` will throw an error; thus, it's important to check to see if an option is `Some` or `None` before accessing the value, or use a method that provides a default value in the case of `None`, like `unwrapOr(defaultValue)`.
 *
 * `Option` provides a number of methods for changing an `Option` into another value and controlling code flow based on its value. By using these methods, we can skip most of the null checking that TypeScript would usually require of us.
 *
 * ## Examples
 *
 * For example, here's an interface representing a theoretical TypeScript type:
 *
 * ```typescript
 * interface Tree {
 *   static getById(id): Tree | null;
 *   static create(id): Tree;
 *
 *   public getNode<T>(nodeId): Node<T> | null;
 * }
 *
 * interface Node<T> {
 *   public data: T | null
 * }
 * ```
 *
 * Here's a typical example of how one might interact with this API:
 *
 * ```typescript
 * function getNodeData<T>(id: string, nodeId: string) {
 *   let tree = Tree.getById(id);
 *   if (!tree) {
 *     tree = Tree.create(id);
 *   }
 *
 *   let node = tree.getNode<T>(nodeId);
 *
 *   if (node && node.data) {
 *     return node.data;
 *   } else {
 *     return defaultData;
 *   }
 * }
 * ```
 *
 * Here's the same example, using an API that returns `Option`s:
 *
 * ```typescript
 * interface Tree {
 *   static getById(id): Option<Tree>;
 *   static create(id): Tree;
 *
 *   public getNode<T>(nodeId): Option<Node<T>>;
 * }
 *
 * interface Node<T> {
 *   public data: Option<T>
 * }
 *
 * function getNodeData<T>(id: string, nodeId: string): T {
 *   // Start with an `Option<Tree>`
 *   return Tree.getById(id)
 *     // If `None`, return `Some(Tree.create(...))` instead
 *     .orElse(() => Some(Tree.create(id)))
 *     // Turn the `Option<Tree>` into an `Option<Node>`
 *     .andThen(tree => tree.getNode<T>(nodeId))
 *     // Turn the `Option<Node>` into `Option<T>`
 *     .map(node => node.data)
 *     // If `Some`, return the inner value, otherwise return `defaultData`
 *     .unwrapOr(defaultData);
 * }
 * ```
 *
 * Since calling `Some(value)` when `value` is `null` or `undefined` returns `None`, we can easily wrap external APIs that don't use options:
 *
 * ```typescript
 * interface Tree {
 *   static getById(id): Tree | null;
 *   static create(id): Tree;
 *
 *   public getNode<T>(nodeId): Node<T> | null;
 * }
 *
 * interface Node<T> {
 *   public data: T | null
 * }
 *
 * function getNodeData<T>(id: string, nodeId: string): T {
 *   // Start with an `Option<Tree>`; this will be `None` if `Tree.getById()` returns `null`
 *   return Some(Tree.getById(id))
 *     // If `None`, return `Some(Tree.create(...))` instead
 *     .orElse(() => Some(Tree.create(id)))
 *     // Turn the `Option<Tree>` into an `Option<Node>`; this will be `None` if `getNode()` returns `null`
 *     .map(tree => tree.getNode<T>(nodeId))
 *     // Turn the `Option<Node>` into `Option<T>`
 *     .map(node => node.data)
 *     // If `Some`, return the inner value, otherwise return `defaultData`
 *     .unwrapOr(defaultData);
 * }
 * ```
 *
 * @see {@link OptionMethods} for more information on the methods available on `Option`.
 *
 * @typeParam T - The type of the wrapped value
 *
 * @module Option
 * @group option
 */

import { Err, ErrMarker, Ok, OkMarker, Result } from "./result";

/**
 * All the methods available on `Option<T>`.
 *
 * @typeParam T - The type of the wrapped value
 * @group option
 */
interface OptionMethods<T> {
  /**
   * Returns `true` if the value is a `Some`.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.isSome(); // true
   *
   * const none = None;
   * const result2 = none.isSome(); // false
   * ```
   *
   * @returns {boolean} `true` if the value is a `Some`, `false` otherwise.
   * @group Query Methods
   */
  isSome: () => boolean;
  /**
   * Returns `true` if the value is a `Some` and the given function returns `true`.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.isSomeAnd(value => value > 0); // true
   *
   * const none = None;
   * const result2 = none.isSomeAnd(value => value > 0); // false
   * ```
   *
   * @param fn - A function that takes the wrapped value and returns a boolean.
   * @returns {boolean} `true` if the value is a `Some` and the given function returns `true`, `false` otherwise.
   * @group Query Methods
   */
  isSomeAnd: (fn: (value: T) => boolean) => boolean;
  /**
   * Returns `true` if the value is a `None`.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.isNone(); // false
   *
   * const none = None;
   * const result2 = none.isNone(); // true
   * ```
   *
   * @returns {boolean} `true` if the value is a `None`, `false` otherwise.
   * @group Query Methods
   */
  isNone: () => boolean;
  /**
   * Returns `true` if the value is a `None` or the given function returns `true`.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.isNoneOr(value => value > 0); // true
   *
   * const none = None;
   * const result2 = none.isNoneOr(value => value > 0); // true
   * ```
   *
   * @param fn - A function that takes the wrapped value and returns a boolean.
   * @returns {boolean} `true` if the value is a `None` or the given function returns `true`, `false` otherwise.
   * @group Query Methods
   */
  isNoneOr: (fn: (value: T) => boolean) => boolean;
  /**
   * Returns the wrapped value. If the option is `None`, this will throw an error.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.unwrap(); // 1
   *
   * const none = None;
   * const result2 = none.unwrap(); // throws Error
   * ```
   *
   * @returns {T} The wrapped value.
   * @group Unwrap Methods
   */
  unwrap: () => T;
  /**
   * Returns the wrapped value. If the option is `None`, this will return the provided default value.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.unwrapOr(0); // 1
   *
   * const none = None;
   * const result2 = none.unwrapOr(0); // 0
   * ```
   *
   * @param defaultValue - The value to return if the option is `None`.
   * @returns {T} The wrapped value.
   * @group Unwrap Methods
   */
  unwrapOr: (defaultValue: T) => T;
  /**
   * Returns the wrapped value. If the option is `None`, this will call the provided function and return its result.
   * This function is useful for providing a default value that is expensive to compute or has side effects.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.unwrapOrElse(() => 0); // 1
   *
   * const none = None;
   * const result2 = none.unwrapOrElse(() => 0); // 0
   * ```
   *
   * @param fn - A function that returns the default value if the option is `None`.
   * @returns {T} The wrapped value.
   * @group Unwrap Methods
   */
  unwrapOrElse: (fn: () => T) => T;
  /**
   * Returns the wrapped value. If the option is `None`, this will throw an error with the provided message.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.expect("Expected a value"); // 1
   *
   * const none = None;
   * const result2 = none.expect("Expected a value"); // throws Error
   * ```
   *
   * @param msg - The message to throw if the option is `None`.
   * @returns {T} The wrapped value.
   * @group Unwrap Methods
   */
  expect: (msg: string) => T;

  /**
   * Returns an `Option<U>` by mapping the inner value of the source option with `fn`.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.map(value => String(value)); // Some("1")
   *
   * const none = None;
   * const result2 = none.map(value => String(value)); // None
   * ```
   *
   * @typeParam U - The type of the new wrapped value.
   * @param fn - A function that takes the wrapped value and returns a new value.
   * @returns {Option<U>} A new option containing the transformed value.
   * @group Transform Methods
   */
  map: <U>(fn: (value: T) => U) => Option<U>;

  /**
   * Returns an option wrapping the provided `defaultValue` if the option is `None`,
   * or calls `fn` with the inner value and returns a new option wrapping its return value.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.mapOr("default", value => String(value)); // Some("1")
   *
   * const none = None;
   * const result2 = none.mapOr("default", value => String(value)); // Some("default")
   * ```
   *
   * @typeParam U - The type of the new wrapped value.
   * @param defaultValue - The value to use if the option is `None`.
   * @param fn - A function that takes the wrapped value and returns a new value.
   * @group Transform Methods
   */
  mapOr: <U>(defaultValue: U, fn: (value: T) => U) => Option<U>;

  /**
   * Returns an option wrapping the return value of `defaultFn` if the option is `None`,
   * or calls `mapFn` with the inner value and returns a new option wrapping its return value.
   * This function is useful for providing a default value that is expensive to compute or has side effects.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.mapOrElse(() => "default", value => String(value)); // Some("1")
   *
   * const none = None;
   * const result2 = none.mapOrElse(() => "default", value => String(value)); // Some("default")
   * ```
   *
   * @typeParam U - The type of the new wrapped value.
   * @param defaultFn - A function that returns the default value if the option is `None`.
   * @param mapFn - A function that takes the wrapped value and returns a new value.
   * @returns {Option<U>} A new option containing either the default or transformed value.
   * @group Transform Methods
   */
  mapOrElse: <U>(defaultFn: () => U, mapFn: (value: T) => U) => Option<U>;

  /**
   * Returns `None` if the source option is `None`, otherwise returns `other`.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.and(Some(2)); // Some(2)
   *
   * const none = None;
   * const result2 = none.and(Some(2)); // None
   * ```
   *
   * @typeParam U - The type of the new wrapped value.
   * @param other - The option to return if this option is `Some`.
   * @returns {Option<U>} Either `None` or the provided option.
   * @group Transform Methods
   */
  and: <U>(other: Option<U>) => Option<U>;

  /**
   * Returns `None` if the source option is `None`, otherwise calls `fn`
   * with the inner value and returns the result.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.andThen(value => Some(value * 2)); // Some(2)
   *
   * const none = None;
   * const result2 = none.andThen(value => Some(value * 2)); // None
   * ```
   *
   * @typeParam U - The type of the new wrapped value.
   * @param fn - A function that takes the wrapped value and returns a new option.
   * @returns {Option<U>} The result of `fn` or `None`.
   * @group Transform Methods
   */
  andThen: <U>(fn: (value: T) => Option<U>) => Option<U>;

  /**
   * Returns the source option if it is `Some`, otherwise returns `other`.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.or(Some(2)); // Some(1)
   *
   * const none = None;
   * const result2 = none.or(Some(2)); // Some(2)
   * ```
   *
   * @param other - The option to return if this option is `None`.
   * @returns {Option<T>} Either this option or the provided option.
   * @group Transform Methods
   */
  or: (other: Option<T>) => Option<T>;

  /**
   * Returns the source option if it is `Some`, otherwise calls `fn` and returns the result.
   * This function is useful for providing a default value that is expensive to compute or has side effects.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.orElse(() => Some(2)); // Some(1)
   *
   * const none = None;
   * const result2 = none.orElse(() => Some(2)); // Some(2)
   * ```
   *
   * @param fn - A function that returns a new option.
   * @returns {Option<T>} Either this option or the result of `fn`.
   * @group Transform Methods
   */
  orElse: (fn: () => Option<T>) => Option<T>;

  /**
   * Returns the source option or `other` if exactly one of them is `Some`, otherwise returns `None`.
   *
   * @example
   * ```typescript
   * const opt1 = Some(1);
   * const opt2 = Some(2);
   * const result = opt1.xor(opt2); // None
   *
   * const none = None;
   * const result2 = none.xor(Some(2)); // Some(2)
   * ```
   *
   * @param other - The option to compare against.
   * @returns {Option<T>} Either this option, the other option, or `None`.
   * @group Transform Methods
   */
  xor: (other: Option<T>) => Option<T>;

  /**
   * Returns `None` if the option is `None`, otherwise calls `fn` with the inner value and returns:
   * - `Some<T>` with the original wrapped value if `fn` returns true
   * - `None` if `fn` returns false
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.filter(value => value > 0); // Some(1)
   *
   * const opt2 = Some(1);
   * const result2 = opt2.filter(value => value < 0); // None
   *
   * const none = None;
   * const result3 = none.filter(value => value > 0); // None
   * ```
   *
   * @param fn - A function that takes the wrapped value and returns a boolean.
   * @returns {Option<T>} Either this option or `None`.
   * @group Transform Methods
   */
  filter: (fn: (value: T) => boolean) => Option<T>;

  /**
   * Converts from `Option<Option<T>>` to `Option<T>`. Only one level of nesting is removed.
   *
   * @example
   * ```typescript
   * const opt = Some(Some(1));
   * const result = opt.flatten(); // Some(1)
   *
   * const opt2 = Some(Some(1));
   * const result2 = opt2.flatten(); // Some(1)
   *
   * const none = None;
   * const result3 = none.flatten(); // None
   * ```
   *
   * @returns {Option<T>} The flattened option.
   * @group Transform Methods
   */
  flatten: () => Option<T>;

  /**
   * Converts the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)`
   * and `None` to `Err(defaultValue)`.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.okOr("default error"); // Ok(1)
   *
   * const none = None;
   * const result2 = none.okOr("default error"); // Err("default error")
   * ```
   *
   * @typeParam E - The type of the error value.
   * @param defaultError - The error value to use if the option is `None`.
   * @returns {Result<T, E>} A result containing either the wrapped value or the error.
   * @group Transform Methods
   */
  okOr: <E>(defaultError: E) => Result<T, E>;

  /**
   * Converts the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)`
   * and `None` to `Err(fn())`.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.okOrElse(() => "default error"); // Ok(1)
   *
   * const none = None;
   * const result2 = none.okOrElse(() => "default error"); // Err("default error")
   * ```
   *
   * @typeParam E - The type of the error value.
   * @param fn - A function that returns the error value if the option is `None`.
   * @returns {Result<T, E>} A result containing either the wrapped value or the error.
   * @group Transform Methods
   */
  okOrElse: <E>(fn: () => E) => Result<T, E>;

  /**
   * Returns the result of calling `cases.some()` with the inner value if the option is `Some`,
   * otherwise returns the result of calling `cases.none()`.
   *
   * @example
   * ```typescript
   * const opt = Some(1);
   * const result = opt.match({
   *   some: (value) => value * 2,
   *   none: () => 0,
   * });
   * ```
   *
   * @typeParam U - The type of the result.
   * @param cases - An object containing functions to handle both `Some` and `None` cases.
   * @returns {U} The result of calling the appropriate function.
   * @group Equality Checks
   */
  match: <U>(cases: { some: (value: T) => U; none: () => U }) => U;

  /**
   * Returns true if both options are `Some` and their inner values are equal using
   * the JavaScript `==` operator, or if both options are `None`. If the inner values
   * are both `Option`s or `Result`s, then the comparison will be recursive using `equals`
   * on the inner values.
   *
   * @example
   * ```typescript
   * const opt1 = Some(1);
   * const opt2 = Some(1);
   * const result = opt1.equals(opt2); // true
   *
   * const opt3 = Some(Ok(1));
   * const opt4 = Some(Ok(1));
   * const result2 = opt3.equals(opt4); // true
   *
   * const opt5 = Some(None);
   * const opt6 = Some(None);
   * const result3 = opt5.equals(opt6); // true
   * ```
   *
   * @param other - The option to compare against.
   * @returns {boolean} Whether the options are equal.
   * @group Equality Checks
   */
  equals: (other: Option<T>) => boolean;

  /**
   * Returns true if both options are `Some` and their inner values are equal using
   * the JavaScript `===` operator, or if both options are `None`. If the inner values
   * are both `Option`s or `Result`s, then the comparison will be recursive using `strictEquals`
   * on the inner values.
   *
   * @example
   * ```typescript
   * const obj = {};
   * const opt1 = Some(obj);
   * const opt2 = Some(obj);
   * const result = opt1.strictEquals(opt2); // true
   *
   * const opt3 = Some(None);
   * const opt4 = Some(None);
   * const result2 = opt3.strictEquals(opt4); // true
   * ```
   * @returns {boolean} Whether the options are strictly equal.
   * @group Equality Checks
   */
  strictEquals: (other: Option<T>) => boolean;
}

/**
 * @hidden
 */
export const SomeMarker = Symbol("Some");
/**
 * @hidden
 */
export const NoneMarker = Symbol("None");

/**
 * @hidden
 */
type None<T> = {
  readonly _type: typeof NoneMarker;
} & OptionMethods<T>;

/**
 * @hidden
 */
type Some<T> = {
  readonly _type: typeof SomeMarker;
  readonly value: T;
} & OptionMethods<T>;

/**
 * A value that represents the existance (or lack thereof) of another value.
 *
 * @typeParam T - The type of the wrapped value
 * @group option
 */
export type Option<T> = (Some<T> | None<T>) & OptionMethods<T>;

const NonePrototype: OptionMethods<any> = {
  isSome() {
    return false;
  },
  isSomeAnd(_fn: (value: never) => boolean) {
    return false;
  },
  isNone() {
    return true;
  },
  isNoneOr(_fn: (value: never) => boolean) {
    return true;
  },
  unwrap(): never {
    throw new Error("Tried to unwrap None");
  },
  unwrapOr<T>(defaultValue: T) {
    return defaultValue;
  },
  unwrapOrElse<T>(fn: () => T) {
    return fn();
  },
  expect(msg: string): never {
    throw new Error(msg);
  },
  map<U>(_fn: (value: never) => U) {
    return None;
  },
  mapOr<U>(defaultValue: U, _fn: (value: never) => U) {
    return Some(defaultValue);
  },
  mapOrElse<U>(defaultFn: () => U, _mapFn: (value: never) => U) {
    return Some(defaultFn());
  },
  and<U>(_other: Option<U>) {
    return None;
  },
  andThen<U>(_fn: (value: never) => Option<U>) {
    return None;
  },
  or<T>(other: Option<T>) {
    return other;
  },
  xor<T>(other: Option<T>) {
    return other.isSome() ? other : None;
  },
  orElse<T>(fn: () => Option<T>) {
    return fn();
  },
  filter(_fn: (value: never) => boolean) {
    return None;
  },
  flatten() {
    return None;
  },
  okOr<T, E>(error: E): Result<T, E> {
    return Err(error);
  },
  okOrElse<T, E>(fn: () => E): Result<T, E> {
    return Err(fn());
  },
  match<U>(cases: { some: (value: never) => U; none: () => U }) {
    return cases.none();
  },
  equals(other: Option<unknown>) {
    return (other as unknown) === (None as unknown);
  },
  strictEquals(other: Option<unknown>) {
    return (other as unknown) === (None as unknown);
  },
};

const SomePrototype: OptionMethods<any> = {
  isSome() {
    return true;
  },
  isSomeAnd<T>(this: Some<T>, fn: (value: T) => boolean) {
    return fn(this.value);
  },
  isNone() {
    return false;
  },
  isNoneOr<T>(this: Some<T>, fn: (value: T) => boolean) {
    return fn(this.value);
  },
  unwrap<T>(this: Some<T>) {
    return this.value;
  },
  unwrapOr<T>(this: Some<T>, _defaultValue: T) {
    return this.value;
  },
  unwrapOrElse<T>(this: Some<T>, _fn: () => T) {
    return this.value;
  },
  expect<T>(this: Some<T>, _msg: string) {
    return this.value;
  },
  map<T, U>(this: Some<T>, fn: (value: T) => U) {
    return Some(fn(this.value));
  },
  mapOr<T, U>(this: Some<T>, _defaultValue: U, fn: (value: T) => U) {
    return Some(fn(this.value));
  },
  mapOrElse<T, U>(this: Some<T>, _defaultFn: () => U, mapFn: (value: T) => U) {
    return Some(mapFn(this.value));
  },
  and<T, U>(this: Some<T>, other: Option<U>) {
    return other;
  },
  andThen<T, U>(this: Some<T>, fn: (value: T) => Option<U>) {
    return fn(this.value);
  },
  or<T>(this: Some<T>, _other: Option<T>) {
    return this;
  },
  xor<T>(this: Some<T>, other: Option<T>) {
    return other.isSome() ? None : this;
  },
  orElse<T>(this: Some<T>, _fn: () => Option<T>) {
    return this;
  },
  filter<T>(this: Some<T>, fn: (value: T) => boolean) {
    return fn(this.value) ? this : None;
  },
  flatten<T>(this: Some<T>) {
    if ((this.value as Some<T>)._type === SomeMarker) {
      return this.value as Some<T>;
    }
    return this;
  },
  okOr<T, E>(this: Some<T>, _error: E): Result<T, E> {
    return Ok(this.value);
  },
  okOrElse<T, E>(this: Some<T>, _fn: () => E): Result<T, E> {
    return Ok(this.value);
  },
  match<T, U>(this: Some<T>, cases: { some: (value: T) => U; none: () => U }) {
    return cases.some(this.value);
  },
  equals<T>(this: Some<T>, other: Option<T>) {
    if (other.isNone()) return false;
    const wrapped = other.unwrap();
    if (
      (wrapped as any)._type === SomeMarker &&
      (this.value as any)._type === SomeMarker
    ) {
      return (this.value as Some<T>).equals(wrapped as Some<T>);
    }
    if (
      (wrapped as any)._type === OkMarker ||
      (wrapped as any)._type === ErrMarker
    ) {
      return (this.value as Result<any, any>).equals(
        wrapped as Result<any, any>
      );
    }
    return this.value == wrapped;
  },
  strictEquals<T>(this: Some<T>, other: Option<T>) {
    if (other.isNone()) return false;
    const wrapped = other.unwrap();
    if (
      (wrapped as any)._type === SomeMarker &&
      (this.value as any)._type === SomeMarker
    ) {
      return (this.value as Some<T>).strictEquals(wrapped as Some<T>);
    }
    if (
      (wrapped as any)._type === OkMarker ||
      (wrapped as any)._type === ErrMarker
    ) {
      return (this.value as Result<any, any>).strictEquals(
        wrapped as Result<any, any>
      );
    }
    return this.value === wrapped;
  },
};

/**
 * Creates a `Some` value.
 *
 * @typeParam T - The type of the wrapped value.
 * @param value - The value to wrap in a `Some`.
 * @returns A `Some` value containing the given value.
 *
 * @group option
 */
export function Some<T>(value: T): Option<T> {
  // TODO: move this to an `Option()` function???
  if (value === undefined || value === null) {
    return None;
  }

  return Object.create(SomePrototype, {
    _type: { value: SomeMarker, enumerable: true, writable: false },
    value: { value, enumerable: true, writable: false },
  });
}

function NoneFn<T>(): Option<T> {
  return Object.create(NonePrototype, {
    _type: { value: NoneMarker, enumerable: true, writable: false },
  });
}

/**
 * @hidden
 */
export const None = NoneFn<any>();
