import { Err, Ok, Result } from "./result";

interface OptionMethods<T> {
  isSome: () => boolean;
  isSomeAnd: (fn: (value: T) => boolean) => boolean;
  isNone: () => boolean;
  isNoneOr: (fn: (value: T) => boolean) => boolean;
  unwrap: () => T;
  unwrapOr: (defaultValue: T) => T;
  unwrapOrElse: (fn: () => T) => T;
  expect: (msg: string) => T;

  map: <U>(fn: (value: T) => U) => Option<U>;
  mapOr: <U>(defaultValue: U, fn: (value: T) => U) => Option<U>;
  mapOrElse: <U>(defaultFn: () => U, mapFn: (value: T) => U) => Option<U>;
  and: <U>(other: Option<U>) => Option<U>;
  andThen: <U>(fn: (value: T) => Option<U>) => Option<U>;
  or: (other: Option<T>) => Option<T>;
  orElse: (fn: () => Option<T>) => Option<T>;
  xor: (other: Option<T>) => Option<T>;
  filter: (fn: (value: T) => boolean) => Option<T>;
  flatten: () => Option<T>;

  okOr: <E>(defaultValue: E) => Result<T, E>;
  okOrElse: <E>(fn: () => E) => Result<T, E>;

  match: <U>(cases: { some: (value: T) => U; none: () => U }) => U;

  equals: (other: Option<T>) => boolean;
  strictEquals: (other: Option<T>) => boolean;
}

export const SomeMarker = Symbol("Some");
export const NoneMarker = Symbol("None");

type None<T> = {
  readonly _type: typeof NoneMarker;
} & OptionMethods<T>;

type Some<T> = {
  readonly _type: typeof SomeMarker;
  readonly value: T;
} & OptionMethods<T>;

export type Option<T> = Some<T> | None<T>;

export function Some<T>(value: T): Option<T> {
  if (value === undefined || value === null) {
    return None;
  }

  const ret = {
    _type: SomeMarker,
    value,
  };

  Object.defineProperties(ret, {
    isSome: {
      enumerable: false,
      value: function (): boolean {
        return true;
      },
    },
    isSomeAnd: {
      enumerable: false,
      value: function (fn: (value: T) => boolean): boolean {
        return fn(this.value);
      },
    },
    isNone: {
      enumerable: false,
      value: function (): boolean {
        return false;
      },
    },
    isNoneOr: {
      enumerable: false,
      value: function (fn: (value: T) => boolean): boolean {
        return fn(this.value);
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
    expect: {
      enumerable: false,
      value: function (_msg: string): T {
        return this.value;
      },
    },
    map: {
      enumerable: false,
      value: function <U>(fn: (value: T) => U): Option<U> {
        return Some(fn(this.value));
      },
    },
    mapOr: {
      enumerable: false,
      value: function <U>(_defaultValue: U, fn: (value: T) => U): Option<U> {
        return Some(fn(this.value));
      },
    },
    mapOrElse: {
      enumerable: false,
      value: function <U>(
        _defaultFn: () => U,
        mapFn: (value: T) => U
      ): Option<U> {
        return Some(mapFn(this.value));
      },
    },
    and: {
      enumerable: false,
      value: function <U>(other: Option<U>): Option<U> {
        return other;
      },
    },
    andThen: {
      enumerable: false,
      value: function <U>(fn: (value: T) => Option<U>): Option<U> {
        return fn(this.value);
      },
    },
    or: {
      enumerable: false,
      value: function (_other: Option<T>): Option<T> {
        return this;
      },
    },
    xor: {
      enumerable: false,
      value: function (other: Option<T>): Option<T> {
        if (other.isSome()) {
          return None;
        } else {
          return this;
        }
      },
    },
    orElse: {
      enumerable: false,
      value: function (_fn: () => Option<T>): Option<T> {
        return this;
      },
    },
    filter: {
      enumerable: false,
      value: function (fn: (value: T) => boolean): Option<T> {
        return fn(this.value) ? this : None;
      },
    },
    flatten: {
      enumerable: false,
      value: function (): Option<T> {
        if ((this.value as Some<T>)._type === SomeMarker) {
          return this.value as Some<T>;
        }
        return this;
      },
    },

    okOr: {
      enumerable: false,
      value: function <E>(_defaultValue: E): Result<T, E> {
        return Ok(this.value);
      },
    },
    okOrElse: {
      enumerable: false,
      value: function <E>(_fn: () => E): Result<T, E> {
        return Ok(this.value);
      },
    },

    match: {
      enumerable: false,
      value: function <U>(cases: { some: (value: T) => U; none: () => U }): U {
        return cases.some(this.value);
      },
    },
    equals: {
      enumerable: false,
      value: function (other: Option<T>): boolean {
        if (other.isNone()) {
          return false;
        }
        const wrapped = other.unwrap();
        if (
          (wrapped as any)._type === SomeMarker &&
          (this.value as any)._type === SomeMarker
        ) {
          return (this.value as Some<T>).equals(wrapped as Some<T>);
        } else {
          return this.value == wrapped;
        }
      },
    },
    strictEquals: {
      enumerable: false,
      value: function (other: Option<T>): boolean {
        if (other.isNone()) {
          return false;
        }
        const wrapped = other.unwrap();
        if (
          (wrapped as any)._type === SomeMarker &&
          (this.value as any)._type === SomeMarker
        ) {
          return (this.value as Some<T>).strictEquals(wrapped as Some<T>);
        } else {
          return this.value === wrapped;
        }
      },
    },
  });

  return ret as Option<T>;
}

function NoneFn<T>(): Option<T> {
  const ret = {
    _type: NoneMarker,
  };

  Object.defineProperties(ret, {
    isSome: {
      enumerable: false,
      value: function (): boolean {
        return false;
      },
    },
    isSomeAnd: {
      enumerable: false,
      value: function (_fn: (value: T) => boolean): boolean {
        return false;
      },
    },
    isNone: {
      enumerable: false,
      value: function (): boolean {
        return true;
      },
    },
    isNoneOr: {
      enumerable: false,
      value: function (_fn: (value: T) => boolean): boolean {
        return true;
      },
    },
    unwrap: {
      enumerable: false,
      value: function (): T {
        throw new Error("Tried to unwrap None");
      },
    },
    unwrapOr: {
      enumerable: false,
      value: function <U extends T>(defaultValue: U): U {
        return defaultValue;
      },
    },
    unwrapOrElse: {
      enumerable: false,
      value: function <U extends T>(fn: () => U): U {
        return fn();
      },
    },
    expect: {
      enumerable: false,
      value: function (msg: string): T {
        throw new Error(msg);
      },
    },
    map: {
      enumerable: false,
      value: function <U>(_fn: (value: T) => U): Option<U> {
        return None;
      },
    },
    mapOr: {
      enumerable: false,
      value: function <U>(defaultValue: U, _fn: (value: T) => U): Option<U> {
        return Some(defaultValue);
      },
    },
    mapOrElse: {
      enumerable: false,
      value: function <U>(
        defaultFn: () => U,
        _mapFn: (value: T) => U
      ): Option<U> {
        return Some(defaultFn());
      },
    },
    and: {
      enumerable: false,
      value: function <U>(_other: Option<U>): Option<U> {
        return None;
      },
    },
    andThen: {
      enumerable: false,
      value: function <U>(_fn: (value: T) => Option<U>): Option<U> {
        return None;
      },
    },
    or: {
      enumerable: false,
      value: function <U extends T>(_other: Option<U>): Option<U> {
        return _other;
      },
    },
    xor: {
      enumerable: false,
      value: function (other: Option<T>): Option<T> {
        if (other.isSome()) {
          return other;
        } else {
          return None;
        }
      },
    },
    orElse: {
      enumerable: false,
      value: function (fn: () => Option<T>): Option<T> {
        return fn();
      },
    },
    filter: {
      enumerable: false,
      value: function (_fn: (value: T) => boolean): Option<T> {
        return None;
      },
    },
    flatten: {
      enumerable: false,
      value: function (): Option<T> {
        return None;
      },
    },

    okOr: {
      enumerable: false,
      value: function <E>(error: E): Result<T, E> {
        return Err(error);
      },
    },
    okOrElse: {
      enumerable: false,
      value: function <E>(fn: () => E): Result<T, E> {
        return Err(fn());
      },
    },

    match: {
      enumerable: false,
      value: function <U>(cases: { some: (value: T) => U; none: () => U }): U {
        return cases.none();
      },
    },
    equals: {
      enumerable: false,
      value: function (_other: Option<T>): boolean {
        return _other === None;
      },
    },
    strictEquals: {
      enumerable: false,
      value: function (_other: Option<T>): boolean {
        return _other === None;
      },
    },
  });

  return ret as Option<T>;
}

/**
 * A constant representing a `None` value.
 */
export const None = NoneFn<any>();
