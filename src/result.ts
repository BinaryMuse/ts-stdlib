/**
 * ```typescript
 * import { Result, Ok, Err } from "@binarymuse/ts-stdlib"
 * ```
 *
 * > *(For a list of methods available on `Result<T, E>`, see {@link ResultMethods})*
 *
 * ## Overview
 *
 * A `Result<T, E>` is a value that represents either a successful computation (`Ok<T>`) or an error (`Err<E>`). It's similar to try/catch blocks, but provides a more functional approach to handling errors and composing operations that might fail.
 *
 * To create a `Result` representing a successful computation of type `T`, use the `Ok` function. For example: `const result = Ok(value)`. If you want to create a `Result` representing an error of type `E`, use `Err`. For example: `const error = Err(new Error("Something went wrong"))`.
 *
 * To get the successful value, call `unwrap()` on the `Result`. If the result is `Err`, then `unwrap()` will throw the error; thus, it's important to check if a result is `Ok` or `Err` before accessing the value, or use a method that provides a default value in case of `Err`, like `unwrapOr(defaultValue)`.
 *
 * `Result` provides several methods for transforming results and handling errors in a clean, functional way. By using these methods, we can avoid many try/catch blocks and make our error handling more explicit.
 *
 * ## Examples
 *
 * For example, here's a typical example using traditional error handling:
 *
 * ```typescript
 * interface UserAPI {
 *   fetchUser(id: string): Promise<User>;
 *   updateProfile(user: User, data: ProfileData): Promise<User>;
 *   sendNotification(user: User, message: string): Promise<void>;
 * }
 *
 * async function updateUserProfile(
 *   userId: string,
 *   profileData: ProfileData
 * ) {
 *   try {
 *     const user = await api.fetchUser(userId);
 *     const updatedUser = await api.updateProfile(user, profileData);
 *     await api.sendNotification(updatedUser, "Profile updated!");
 *     return updatedUser;
 *   } catch (error) {
 *     console.error("Failed to update profile:", error);
 *     throw error;
 *   }
 * }
 * ```
 *
 * Here's the same example using `Result`:
 *
 * ```typescript
 * interface UserAPI {
 *   fetchUser(id: string): Promise<Result<User, Error>>;
 *   updateProfile(user: User, data: ProfileData): Promise<Result<User, Error>>;
 *   sendNotification(user: User, message: string): Promise<Result<void, Error>>;
 * }
 *
 * async function updateUserProfile(
 *   userId: string,
 *   profileData: ProfileData
 * ): Promise<Result<User, Error>> {
 *   return (await api.fetchUser(userId))
 *     .andThen(user => api.updateProfile(user, profileData))
 *     .andThen(updatedUser =>
 *       api.sendNotification(updatedUser, "Profile updated!")
 *         .map(() => updatedUser)
 *     );
 * }
 * ```
 *
 * You can convert functions that might throw into `Result`-returning functions using a wrapper:
 *
 * ```typescript
 * function tryResult<T>(fn: () => T): Result<T, Error> {
 *   try {
 *     return Ok(fn());
 *   } catch (e) {
 *     return Err(e instanceof Error ? e : new Error(String(e)));
 *   }
 * }
 *
 * function divide(a: number, b: number): number {
 *   if (b === 0) throw new Error("Division by zero");
 *   return a / b;
 * }
 *
 * // Usage
 * const result = tryResult(() => divide(10, 2))
 *   .map(value => value * 2)
 *   .unwrapOr(0);  // Returns 10
 *
 * const error = tryResult(() => divide(10, 0))
 *   .map(value => value * 2)
 *   .unwrapOr(0);  // Returns 0
 * ```
 *
 * This pattern is particularly useful when working with existing APIs that might throw errors. The `tryResult` wrapper ensures that any thrown errors are properly captured and converted into a `Result` type.
 *
 * `Result` is particularly useful when you need to:
 *
 * * Chain multiple operations that might fail
 * * Transform errors in a type-safe way
 * * Provide better error context than exceptions
 * * Make error handling explicit in your function signatures
 *
 *
 * @module Result
 * @group result
 */

import { None, NoneMarker, Option, Some, SomeMarker } from "./option";

/**
 * All the methods available on `Result<T, E>`.
 *
 * @typeParam T - The type of the success value
 * @typeParam E - The type of the error value
 * @group result
 */
interface ResultMethods<T, E> {
  /**
   * Returns `true` if the result is `Ok`.
   *
   * @returns {boolean} `true` if the result is `Ok`, `false` otherwise.
   * @group Query Methods
   */
  isOk: () => boolean;

  /**
   * Returns `true` if the result is `Ok` and the given function returns `true`.
   *
   * @param fn - A function that takes the success value and returns a boolean.
   * @returns {boolean} `true` if the result is `Ok` and the given function returns `true`, `false` otherwise.
   * @group Query Methods
   */
  isOkAnd: (fn: (value: T) => boolean) => boolean;

  /**
   * Returns `true` if the result is `Err`.
   *
   * @returns {boolean} `true` if the result is `Err`, `false` otherwise.
   * @group Query Methods
   */
  isErr: () => boolean;

  /**
   * Returns `true` if the result is `Err` and the given function returns `true`.
   *
   * @param fn - A function that takes the error value and returns a boolean.
   * @returns {boolean} `true` if the result is `Err` and the given function returns `true`, `false` otherwise.
   * @group Query Methods
   */
  isErrAnd: (fn: (error: E) => boolean) => boolean;

  /**
   * Returns the success value. If the result is `Err`, this will throw an error.
   *
   * @returns {T} The success value.
   * @group Unwrap Methods
   */
  unwrap: () => T;

  /**
   * Returns the success value. If the result is `Err`, this will return the provided default value.
   *
   * @param defaultValue - The value to return if the result is `Err`.
   * @returns {T} The success value or the default value.
   * @group Unwrap Methods
   */
  unwrapOr: (defaultValue: T) => T;

  /**
   * Returns the success value. If the result is `Err`, this will call the provided function and return its result.
   *
   * @param fn - A function that returns the default value if the result is `Err`.
   * @returns {T} The success value or the result of the function.
   * @group Unwrap Methods
   */
  unwrapOrElse: (fn: () => T) => T;

  /**
   * Returns the error value. If the result is `Ok`, this will throw an error.
   *
   * @returns {E} The error value.
   * @group Unwrap Methods
   */
  unwrapErr: () => E;

  /**
   * Returns the success value. If the result is `Err`, this will throw an error with the provided message.
   *
   * @param msg - The message to throw if the result is `Err`.
   * @returns {T} The success value.
   * @group Unwrap Methods
   */
  expect: (msg: string) => T;

  /**
   * Returns the error value. If the result is `Ok`, this will throw an error with the provided message.
   *
   * @param msg - The message to throw if the result is `Ok`.
   * @returns {E} The error value.
   * @group Unwrap Methods
   */
  expectErr: (msg: string) => E;

  /**
   * Returns `other` if the result is `Ok`, otherwise returns the current error.
   *
   * @typeParam U - The type of the success value in the new result.
   * @param other - The result to return if this result is `Ok`.
   * @returns {Result<U, E>} Either the provided result or an error result.
   * @group Transform Methods
   */
  and: <U>(other: Result<U, E>) => Result<U, E>;

  /**
   * Returns `None` if the result is `Err`, otherwise calls `fn` with the success value and returns the result.
   *
   * @typeParam U - The type of the success value in the new result.
   * @param fn - A function that takes the success value and returns a new result.
   * @returns {Result<U, E>} The result of `fn` or an error result.
   * @group Transform Methods
   */
  andThen: <U>(fn: (value: T) => Result<U, E>) => Result<U, E>;

  /**
   * Returns the current result if it is `Ok`, otherwise returns `other`.
   *
   * @typeParam U - The type of the success value in the other result.
   * @param other - The result to return if this result is `Err`.
   * @returns {Result<U, E>} Either this result or the provided result.
   * @group Transform Methods
   */
  or: <U>(other: Result<U, E>) => Result<U, E>;

  /**
   * Returns the current result if it is `Ok`, otherwise calls `fn` and returns the result.
   *
   * @typeParam U - The type of the success value in the new result.
   * @param fn - A function that returns a new result.
   * @returns {Result<U, E>} Either this result or the result of `fn`.
   * @group Transform Methods
   */
  orElse: <U>(fn: () => Result<U, E>) => Result<U, E>;

  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying the function to the success value.
   *
   * @typeParam U - The type of the new success value.
   * @param fn - A function that takes the success value and returns a new value.
   * @returns {Result<U, E>} A new result with the transformed success value.
   * @group Transform Methods
   */
  map: <U>(fn: (value: T) => U) => Result<U, E>;

  /**
   * Returns a result wrapping the provided `defaultValue` if the result is `Err`,
   * or calls `fn` with the success value and returns a new result wrapping its return value.
   *
   * @typeParam U - The type of the new success value.
   * @param defaultValue - The value to use if the result is `Err`.
   * @param fn - A function that takes the success value and returns a new value.
   * @returns {Result<U, E>} A new result containing either the default or transformed value.
   * @group Transform Methods
   */
  mapOr: <U>(defaultValue: U, fn: (value: T) => U) => Result<U, E>;

  /**
   * Returns a result wrapping the return value of `defaultFn` if the result is `Err`,
   * or calls `mapFn` with the success value and returns a new result wrapping its return value.
   *
   * @typeParam U - The type of the new success value.
   * @param defaultFn - A function that returns the default value if the result is `Err`.
   * @param mapFn - A function that takes the success value and returns a new value.
   * @returns {Result<U, E>} A new result containing either the default or transformed value.
   * @group Transform Methods
   */
  mapOrElse: <U>(defaultFn: () => U, mapFn: (value: T) => U) => Result<U, E>;

  /**
   * Maps a `Result<T, E>` to `Result<T, U>` by applying the function to the error value.
   *
   * @typeParam U - The type of the new error value.
   * @param fn - A function that takes the error value and returns a new error value.
   * @returns {Result<T, U>} A new result with the transformed error value.
   * @group Transform Methods
   */
  mapErr: <U>(fn: (error: E) => U) => Result<T, U>;

  /**
   * Converts from `Result<Result<T, E>, E>` to `Result<T, E>`. Only one level of nesting is removed.
   *
   * @returns {Result<T, E>} The flattened result.
   * @group Transform Methods
   */
  flatten: () => Result<T, E>;

  /**
   * Calls `fn` with the success value if the result is `Ok`, otherwise does nothing.
   * Returns the original result.
   *
   * @param fn - A function that takes the success value.
   * @returns {Result<T, E>} The original result.
   * @group Inspect Methods
   */
  inspect: (fn: (value: T) => void) => Result<T, E>;

  /**
   * Calls `fn` with the error value if the result is `Err`, otherwise does nothing.
   * Returns the original result.
   *
   * @param fn - A function that takes the error value.
   * @returns {Result<T, E>} The original result.
   * @group Inspect Methods
   */
  inspectErr: (fn: (error: E) => void) => Result<T, E>;

  /**
   * Converts the `Result<T, E>` into an `Option<T>`, mapping `Ok(v)` to `Some(v)`
   * and `Err(_)` to `None`.
   *
   * @returns {Option<T>} An option containing the success value.
   * @group Transform Methods
   */
  ok: () => Option<T>;

  /**
   * Converts the `Result<T, E>` into an `Option<E>`, mapping `Ok(_)` to `None`
   * and `Err(e)` to `Some(e)`.
   *
   * @returns {Option<E>} An option containing the error value.
   * @group Transform Methods
   */
  err: () => Option<E>;

  /**
   * Returns true if both results are `Ok` and their success values are equal using
   * the JavaScript `==` operator, or if both results are `Err` and their error values
   * are equal using the JavaScript `==` operator.
   *
   * @param other - The result to compare against.
   * @returns {boolean} Whether the results are equal.
   * @group Equality Checks
   */
  equals: (other: Result<T, E>) => boolean;

  /**
   * Returns true if both results are `Ok` and their success values are equal using
   * the JavaScript `===` operator, or if both results are `Err` and their error values
   * are equal using the JavaScript `===` operator.
   *
   * @param other - The result to compare against.
   * @returns {boolean} Whether the results are strictly equal.
   * @group Equality Checks
   */
  strictEquals: (other: Result<T, E>) => boolean;
}

/**
 * @hidden
 */
export const OkMarker = Symbol("Ok");
/**
 * @hidden
 */
export const ErrMarker = Symbol("Err");

/**
 * @group result
 */
type Ok<T, E> = {
  readonly _type: typeof OkMarker;
  readonly value: T;
} & ResultMethods<T, E>;

/**
 * @group result
 */
type Err<T, E> = {
  readonly _type: typeof ErrMarker;
  readonly error: E;
} & ResultMethods<T, E>;

/**
 * A `Result<T, E>` is a value that represents either a successful computation (`Ok<T>`) or an error (`Err<E>`).
 *
 * @typeParam T - The type of the success value
 * @typeParam E - The type of the error value
 * @see {@link ResultMethods} for more information on the methods available on `Result`.
 * @group result
 */
export type Result<T, E> = (Ok<T, E> | Err<T, E>) & ResultMethods<T, E>;

const OkPrototype: ResultMethods<any, any> = {
  isOk(this: Ok<any, any>) {
    return true;
  },
  isOkAnd<T, E>(this: Ok<T, E>, fn: (value: T) => boolean) {
    return fn(this.value);
  },
  isErr(this: Ok<any, any>) {
    return false;
  },
  isErrAnd<T, E>(this: Ok<T, E>, _fn: (error: E) => boolean) {
    return false;
  },
  unwrap<T, E>(this: Ok<T, E>) {
    return this.value;
  },
  unwrapOr<T, E>(this: Ok<T, E>, _defaultValue: T) {
    return this.value;
  },
  unwrapOrElse<T, E>(this: Ok<T, E>, _fn: () => T) {
    return this.value;
  },
  unwrapErr<T, E>(this: Ok<T, E>): never {
    throw new Error(String(this.value));
  },
  expect<T, E>(this: Ok<T, E>, _msg: string) {
    return this.value;
  },
  expectErr<T, E>(this: Ok<T, E>, msg: string): never {
    throw new Error(msg);
  },
  and<T, E, U>(this: Ok<T, E>, other: Result<U, E>) {
    return other;
  },
  andThen<T, E, U>(this: Ok<T, E>, fn: (value: T) => Result<U, E>) {
    return fn(this.value);
  },
  or<T, E, U>(this: Ok<T, E>, _other: Result<U, E>) {
    return this as unknown as Result<U, E>;
  },
  orElse<T, E, U>(this: Ok<T, E>, _fn: () => Result<U, E>) {
    return this as unknown as Result<U, E>;
  },
  map<T, E, U>(this: Ok<T, E>, fn: (value: T) => U) {
    return Ok<U, E>(fn(this.value));
  },
  mapOr<T, E, U>(this: Ok<T, E>, _defaultValue: U, fn: (value: T) => U) {
    return Ok<U, E>(fn(this.value));
  },
  mapOrElse<T, E, U>(
    this: Ok<T, E>,
    _defaultFn: () => U,
    mapFn: (value: T) => U
  ) {
    return Ok<U, E>(mapFn(this.value));
  },
  mapErr<T, E, U>(this: Ok<T, E>, _fn: (error: E) => U) {
    return this as unknown as Result<T, U>;
  },
  flatten<T, E>(this: Ok<T, E>) {
    if (
      (this.value as any)._type === OkMarker ||
      (this.value as any)._type === ErrMarker
    ) {
      return this.value as Result<T, E>;
    }
    return this;
  },
  inspect<T, E>(this: Ok<T, E>, fn: (value: T) => void) {
    fn(this.value);
    return this;
  },
  inspectErr<T, E>(this: Ok<T, E>, _fn: (error: E) => void) {
    return this;
  },
  ok<T, E>(this: Ok<T, E>) {
    return Some(this.value);
  },
  err<T, E>(this: Ok<T, E>) {
    return None;
  },
  equals<T, E>(this: Ok<T, E>, other: Result<T, E>) {
    if (other.isErr()) return false;
    const wrapped = (other as Ok<T, E>).value;
    if (
      (wrapped as any)._type === OkMarker &&
      (this.value as any)._type === OkMarker
    ) {
      return (this.value as Ok<T, E>).equals(wrapped as Ok<T, E>);
    }
    if (
      (wrapped as any)._type === SomeMarker ||
      (wrapped as any)._type === NoneMarker
    ) {
      return (this.value as Option<any>).equals(wrapped as Option<any>);
    }
    return this.value == wrapped;
  },
  strictEquals<T, E>(this: Ok<T, E>, other: Result<T, E>) {
    if (other.isErr()) return false;
    const wrapped = (other as Ok<T, E>).value;
    if (
      (wrapped as any)._type === OkMarker &&
      (this.value as any)._type === OkMarker
    ) {
      return (this.value as Ok<T, E>).strictEquals(wrapped as Ok<T, E>);
    }
    if (
      (wrapped as any)._type === SomeMarker ||
      (wrapped as any)._type === NoneMarker
    ) {
      return (this.value as Option<any>).strictEquals(wrapped as Option<any>);
    }
    return this.value === wrapped;
  },
};

const ErrPrototype: ResultMethods<any, any> = {
  isOk(this: Err<any, any>) {
    return false;
  },
  isOkAnd<T, E>(this: Err<T, E>, _fn: (value: T) => boolean) {
    return false;
  },
  isErr(this: Err<any, any>) {
    return true;
  },
  isErrAnd<T, E>(this: Err<T, E>, fn: (error: E) => boolean) {
    return fn(this.error);
  },
  unwrap<T, E>(this: Err<T, E>): never {
    throw new Error("Tried to unwrap Err");
  },
  unwrapOr<T, E>(this: Err<T, E>, defaultValue: T) {
    return defaultValue;
  },
  unwrapOrElse<T, E>(this: Err<T, E>, fn: () => T) {
    return fn();
  },
  unwrapErr<T, E>(this: Err<T, E>) {
    return this.error;
  },
  expect<T, E>(this: Err<T, E>, msg: string): never {
    throw new Error(msg);
  },
  expectErr<T, E>(this: Err<T, E>, _msg: string) {
    return this.error;
  },
  and<T, E, U>(this: Err<T, E>, _other: Result<U, E>) {
    return this as unknown as Result<U, E>;
  },
  andThen<T, E, U>(this: Err<T, E>, _fn: (value: T) => Result<U, E>) {
    return this as unknown as Result<U, E>;
  },
  or<T, E, U>(this: Err<T, E>, other: Result<U, E>) {
    return other;
  },
  orElse<T, E, U>(this: Err<T, E>, fn: () => Result<U, E>) {
    return fn();
  },
  map<T, E, U>(this: Err<T, E>, _fn: (value: T) => U) {
    return this as unknown as Result<U, E>;
  },
  mapOr<T, E, U>(this: Err<T, E>, defaultValue: U, _mapFn: (value: T) => U) {
    return Ok<U, E>(defaultValue);
  },
  mapOrElse<T, E, U>(
    this: Err<T, E>,
    defaultFn: () => U,
    _mapFn: (value: T) => U
  ) {
    return Ok<U, E>(defaultFn());
  },
  mapErr<T, E, U>(this: Err<T, E>, fn: (error: E) => U) {
    return Err<U, T>(fn(this.error));
  },
  flatten<T, E>(this: Err<T, E>) {
    return this;
  },
  inspect<T, E>(this: Err<T, E>, _fn: (value: T) => void) {
    return this;
  },
  inspectErr<T, E>(this: Err<T, E>, fn: (error: E) => void) {
    fn(this.error);
    return this;
  },
  ok<T, E>(this: Err<T, E>) {
    return None;
  },
  err<T, E>(this: Err<T, E>) {
    return Some(this.error);
  },
  equals<T, E>(this: Err<T, E>, other: Result<T, E>) {
    if (other.isOk()) return false;
    const wrapped = (other as Err<T, E>).error;
    if (
      (wrapped as any)._type === ErrMarker &&
      (this.error as any)._type === ErrMarker
    ) {
      return (this.error as Err<T, E>).equals(wrapped as Err<T, E>);
    }
    if (
      (wrapped as any)._type === SomeMarker ||
      (wrapped as any)._type === NoneMarker
    ) {
      return (this.error as Option<any>).equals(wrapped as Option<any>);
    }
    return this.error == wrapped;
  },
  strictEquals<T, E>(this: Err<T, E>, other: Result<T, E>) {
    if (other.isOk()) return false;
    const wrapped = (other as Err<T, E>).error;
    if (
      (wrapped as any)._type === ErrMarker &&
      (this.error as any)._type === ErrMarker
    ) {
      return (this.error as Err<T, E>).strictEquals(wrapped as Err<T, E>);
    }
    if (
      (wrapped as any)._type === SomeMarker ||
      (wrapped as any)._type === NoneMarker
    ) {
      return (this.error as Option<any>).strictEquals(wrapped as Option<any>);
    }
    return this.error === wrapped;
  },
};

/**
 * Creates a new `Ok` result.
 *
 * @typeParam T - The type of the success value
 * @typeParam E - The type of the error value
 *
 * @group result
 */
export function Ok<T, E = never>(value: T): Result<T, E> {
  return Object.create(OkPrototype, {
    _type: { value: OkMarker, enumerable: true, writable: false },
    value: { value, enumerable: true, writable: false },
  });
}

/**
 * Creates a new `Err` result.
 *
 * @typeParam E - The type of the error value
 * @typeParam T - The type of the success value
 *
 * @group result
 */
export function Err<E, T = never>(error: E): Result<T, E> {
  return Object.create(ErrPrototype, {
    _type: { value: ErrMarker, enumerable: true, writable: false },
    error: { value: error, enumerable: true, writable: false },
  });
}
