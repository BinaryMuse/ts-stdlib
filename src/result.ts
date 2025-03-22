import { None, NoneMarker, Option, Some, SomeMarker } from "./option";

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

  equals: (other: Result<T, E>) => boolean;
  strictEquals: (other: Result<T, E>) => boolean;
}

export const OkMarker = Symbol("Ok");
export const ErrMarker = Symbol("Err");

type Ok<T, E> = {
  readonly _type: typeof OkMarker;
  readonly value: T;
} & ResultMethods<T, E>;

type Err<T, E> = {
  readonly _type: typeof ErrMarker;
  readonly error: E;
} & ResultMethods<T, E>;

export type Result<T, E> = Ok<T, E> | Err<T, E>;

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

export function Ok<T, E = never>(value: T): Result<T, E> {
  return Object.create(OkPrototype, {
    _type: { value: OkMarker, enumerable: true, writable: false },
    value: { value, enumerable: true, writable: false },
  });
}

export function Err<E, T = never>(error: E): Result<T, E> {
  return Object.create(ErrPrototype, {
    _type: { value: ErrMarker, enumerable: true, writable: false },
    error: { value: error, enumerable: true, writable: false },
  });
}
