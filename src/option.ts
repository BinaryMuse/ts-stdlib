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

export function Some<T>(value: T): Option<T> {
  if (value === undefined || value === null) {
    return None;
  }

  return {
    _type: SomeMarker,
    value,
    isSome(): boolean {
      return true;
    },
    isSomeAnd(fn: (value: T) => boolean): boolean {
      return fn(this.value);
    },
    isNone(): boolean {
      return false;
    },
    isNoneOr(fn: (value: T) => boolean): boolean {
      return fn(this.value);
    },
    unwrap(): T {
      return this.value;
    },
    unwrapOr(_defaultValue: T): T {
      return this.value;
    },
    unwrapOrElse(_fn: () => T): T {
      return this.value;
    },
    expect(_msg: string): T {
      return this.value;
    },

    map<U>(fn: (value: T) => U): Option<U> {
      return Some(fn(this.value));
    },
    mapOr<U>(_defaultValue: U, fn: (value: T) => U): Option<U> {
      return Some(fn(this.value));
    },
    mapOrElse<U>(_defaultFn: () => U, mapFn: (value: T) => U): Option<U> {
      return Some(mapFn(this.value));
    },
    and<U>(other: Option<U>): Option<U> {
      return other;
    },
    andThen<U>(fn: (value: T) => Option<U>): Option<U> {
      return fn(this.value);
    },
    or(_other: Option<T>): Option<T> {
      return this;
    },
    xor(other: Option<T>): Option<T> {
      if (other.isSome()) {
        return None;
      } else {
        return this;
      }
    },
    orElse(_fn: () => Option<T>): Option<T> {
      return this;
    },
    filter(fn: (value: T) => boolean): Option<T> {
      return fn(this.value) ? this : None;
    },
    flatten(): Option<T> {
      if (this.isSome() && (this.value as Some<T>)._type === SomeMarker) {
        return this.value as Some<T>;
      }
      return this;
    },

    match(cases) {
      return cases.some(this.value);
    },

    equals(other: Option<T>): boolean {
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
    strictEquals(other: Option<T>): boolean {
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
  } as Option<T>;
}

function NoneFn<T>(): Option<T> {
  return {
    _type: NoneMarker,
    isSome() {
      return false;
    },
    isSomeAnd(_fn: (value: T) => boolean): boolean {
      return false;
    },
    isNone() {
      return true;
    },
    isNoneOr(_fn: (value: T) => boolean): boolean {
      return true;
    },
    unwrap() {
      throw new Error("Tried to unwrap None");
    },
    unwrapOr<U extends T>(defaultValue: U): U {
      return defaultValue;
    },
    unwrapOrElse<U extends T>(fn: () => U): U {
      return fn();
    },
    expect(msg: string): T {
      throw new Error(msg);
    },

    map<U>(_fn: (value: T) => U): Option<U> {
      return None;
    },
    mapOr<U>(defaultValue: U, _fn: (value: T) => U): Option<U> {
      return Some(defaultValue);
    },
    mapOrElse<U>(defaultFn: () => U, _mapFn: (value: T) => U): Option<U> {
      return Some(defaultFn());
    },
    and<U>(_other: Option<U>): Option<U> {
      return None;
    },
    andThen<U>(_fn: (value: T) => Option<U>): Option<U> {
      return None;
    },
    or<U extends T>(_other: Option<U>): Option<U> {
      return _other;
    },
    xor(other: Option<T>): Option<T> {
      if (other.isSome()) {
        return other;
      } else {
        return None;
      }
    },
    orElse(fn: () => Option<T>): Option<T> {
      return fn();
    },
    filter(_fn: (value: T) => boolean): Option<T> {
      return None;
    },
    flatten(): Option<T> {
      return None;
    },

    match(cases) {
      return cases.none();
    },

    equals(_other: Option<T>): boolean {
      return _other === None;
    },
    strictEquals(_other: Option<T>): boolean {
      return _other === None;
    },
  };
}

/**
 * A constant representing a `None` value.
 */
export const None = NoneFn<any>();
