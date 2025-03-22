import { None, Option, Some } from "./option";

interface ResultMethods<T, E> {
  isOk: () => boolean;
  isOkAnd: (fn: (value: T) => boolean) => boolean;
  isErr: () => boolean;
  isErrAnd: (fn: (error: E) => boolean) => boolean;
  unwrap: () => T;
  unwrapOr: (defaultValue: T) => T;
  unwrapOrElse: (fn: () => T) => T;
  unwrapErr: () => E;
  expect: (msg: string) => T;
  expectErr: (msg: string) => E;

  and: <U>(other: Result<U, E>) => Result<U, E>;
  andThen: <U>(fn: (value: T) => Result<U, E>) => Result<U, E>;
  or: <U>(other: Result<U, E>) => Result<U, E>;
  orElse: <U>(fn: () => Result<U, E>) => Result<U, E>;
  map: <U>(fn: (value: T) => U) => Result<U, E>;
  mapOr: <U>(defaultValue: U, fn: (value: T) => U) => Result<U, E>;
  mapOrElse: <U>(defaultFn: () => U, mapFn: (value: T) => U) => Result<U, E>;
  mapErr: <U>(fn: (error: E) => U) => Result<T, U>;
  flatten: () => Result<T, E>;

  inspect: (fn: (value: T) => void) => Result<T, E>;
  inspectErr: (fn: (error: E) => void) => Result<T, E>;

  ok: () => Option<T>;
  err: () => Option<E>;
}

const OkMarker = Symbol("Ok");
const ErrMarker = Symbol("Err");

type Ok<T, E> = {
  readonly _type: typeof OkMarker;
  readonly value: T;
} & ResultMethods<T, E>;

type Err<T, E> = {
  readonly _type: typeof ErrMarker;
  readonly error: E;
} & ResultMethods<T, E>;

export type Result<T, E> = Ok<T, E> | Err<T, E>;

export function Ok<T, E = never>(value: T): Result<T, E> {
  const ret = {
    _type: OkMarker,
    value,
  };

  Object.defineProperties(ret, {
    isOk: {
      enumerable: false,
      value: function (): boolean {
        return true;
      },
    },
    isOkAnd: {
      enumerable: false,
      value: function (fn: (value: T) => boolean): boolean {
        return fn(this.value);
      },
    },
    isErr: {
      enumerable: false,
      value: function (): boolean {
        return false;
      },
    },
    isErrAnd: {
      enumerable: false,
      value: function (_fn: (error: E) => boolean): boolean {
        return false;
      },
    },
    unwrap: {
      enumerable: false,
      value: function (): T {
        return this.value;
      },
    },
    unwrapOr: {
      enumerable: false,
      value: function (_defaultValue: T): T {
        return this.value;
      },
    },
    unwrapOrElse: {
      enumerable: false,
      value: function (_fn: () => T): T {
        return this.value;
      },
    },
    unwrapErr: {
      enumerable: false,
      value: function (): never {
        throw new Error(this.value);
      },
    },
    expect: {
      enumerable: false,
      value: function (_msg: string): T {
        return this.value;
      },
    },
    expectErr: {
      enumerable: false,
      value: function (msg: string): never {
        throw new Error(msg);
      },
    },

    and: {
      enumerable: false,
      value: function <U>(other: Result<U, E>): Result<U, E> {
        return other;
      },
    },
    andThen: {
      enumerable: false,
      value: function <U>(fn: (value: T) => Result<U, E>): Result<U, E> {
        return fn(this.value);
      },
    },
    or: {
      enumerable: false,
      value: function <U>(_other: Result<U, E>): Result<U, E> {
        return this;
      },
    },
    orElse: {
      enumerable: false,
      value: function <U>(_fn: () => Result<U, E>): Result<U, E> {
        return this;
      },
    },
    map: {
      enumerable: false,
      value: function <U>(fn: (value: T) => U): Result<U, E> {
        return Ok(fn(this.value));
      },
    },
    mapOr: {
      enumerable: false,
      value: function <U>(_defaultValue: U, fn: (value: T) => U): Result<U, E> {
        return Ok(fn(this.value));
      },
    },
    mapOrElse: {
      enumerable: false,
      value: function <U>(
        _defaultFn: () => U,
        mapFn: (value: T) => U
      ): Result<U, E> {
        return Ok(mapFn(this.value));
      },
    },
    mapErr: {
      enumerable: false,
      value: function <U>(_fn: (error: E) => U): Result<T, U> {
        return this;
      },
    },
    flatten: {
      enumerable: false,
      value: function (): Result<T, E> {
        if (
          (this.value as any)._type === OkMarker ||
          (this.value as any)._type === ErrMarker
        ) {
          return this.value as Result<T, E>;
        }

        return this as Result<T, E>;
      },
    },

    inspect: {
      enumerable: false,
      value: function <E>(fn: (value: T) => void): Result<T, E> {
        fn(this.value);
        return this;
      },
    },
    inspectErr: {
      enumerable: false,
      value: function <E>(_fn: (error: E) => void): Result<T, E> {
        return this;
      },
    },

    ok: {
      enumerable: false,
      value: function (): Option<T> {
        return Some(this.value);
      },
    },
    err: {
      enumerable: false,
      value: function <E>(): Option<E> {
        return None;
      },
    },
  });

  return ret as Result<T, E>;
}

export function Err<E, T = never>(error: E): Result<T, E> {
  const ret = {
    _type: ErrMarker,
    error,
  };

  Object.defineProperties(ret, {
    isOk: {
      enumerable: false,
      value: function (): boolean {
        return false;
      },
    },
    isOkAnd: {
      enumerable: false,
      value: function (_fn: (value: T) => boolean): boolean {
        return false;
      },
    },
    isErr: {
      enumerable: false,
      value: function (): boolean {
        return true;
      },
    },
    isErrAnd: {
      enumerable: false,
      value: function (fn: (error: E) => boolean): boolean {
        return fn(this.error);
      },
    },
    unwrap: {
      enumerable: false,
      value: function (): E {
        throw new Error("Tried to unwrap Err");
      },
    },
    unwrapOr: {
      enumerable: false,
      value: function <T>(defaultValue: T): T {
        return defaultValue;
      },
    },
    unwrapOrElse: {
      enumerable: false,
      value: function <T>(_fn: () => T): T {
        return _fn();
      },
    },
    unwrapErr: {
      enumerable: false,
      value: function (): E {
        return this.error;
      },
    },
    expect: {
      enumerable: false,
      value: function (msg: string): E {
        throw new Error(msg);
      },
    },
    expectErr: {
      enumerable: false,
      value: function (_msg: string): E {
        return this.error;
      },
    },

    and: {
      enumerable: false,
      value: function <U>(_other: Result<U, E>): Result<U, E> {
        return this;
      },
    },
    andThen: {
      enumerable: false,
      value: function <U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
        return this;
      },
    },
    or: {
      enumerable: false,
      value: function <U>(other: Result<U, E>): Result<U, E> {
        return other;
      },
    },
    orElse: {
      enumerable: false,
      value: function <U>(fn: () => Result<U, E>): Result<U, E> {
        return fn();
      },
    },
    map: {
      enumerable: false,
      value: function <U>(_fn: (value: T) => U): Result<U, E> {
        return this;
      },
    },
    mapOr: {
      enumerable: false,
      value: function <U>(
        defaultValue: U,
        _mapFn: (value: T) => U
      ): Result<U, E> {
        return Ok(defaultValue);
      },
    },
    mapOrElse: {
      enumerable: false,
      value: function <U>(
        defaultFn: () => U,
        _mapFn: (value: T) => U
      ): Result<U, E> {
        return Ok(defaultFn());
      },
    },
    mapErr: {
      enumerable: false,
      value: function <U>(fn: (error: E) => U): Result<T, U> {
        return Err(fn(this.error));
      },
    },
    flatten: {
      enumerable: false,
      value: function (): Result<T, E> {
        return this;
      },
    },

    inspect: {
      enumerable: false,
      value: function <T>(_fn: (value: T) => void): Result<T, E> {
        return this;
      },
    },
    inspectErr: {
      enumerable: false,
      value: function (fn: (error: E) => void): Result<any, E> {
        fn(this.error);
        return this;
      },
    },

    ok: {
      enumerable: false,
      value: function <T>(): Option<T> {
        return None;
      },
    },
    err: {
      enumerable: false,
      value: function (): Option<E> {
        return Some(this.error);
      },
    },
  });

  return ret as Result<any, E>;
}
