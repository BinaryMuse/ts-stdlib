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

const SomeMarker = Symbol("Some");
const NoneMarker = Symbol("None");

type None<T> = {
  readonly _type: typeof NoneMarker;
} & OptionMethods<T>;

type Some<T> = {
  readonly _type: typeof SomeMarker;
  readonly value: T;
} & OptionMethods<T>;

export type Option<T> = Some<T> | None<T>;

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
    return this.value === wrapped;
  },
};

export function Some<T>(value: T): Option<T> {
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
 * A constant representing a `None` value.
 */
export const None = NoneFn<any>();
