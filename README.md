# ts-stdlib

`ts-stdlib` is a set of classes, utilities, and types to make working with TypeScript a little bit nicer. These concepts can be found in many different languages, although many of the implementations here are inspired by Rust.

The library includes:

* `Option<T>` - a type that represents a value (`Some<T>`) or the absense of one (`None`)
* `Result<T, E>` - a type that represents a successful result (`Ok<T>`) or an err (`Err<E>`)
* `Rc<T>` - a reference counted resource

## `Option<T>`

An `Option<T>` has two variants:

* `Some<T>`, representing the existance of the inner value
* `None`, representing the absense of an inner value

### Creating an option

* `Some(value: T): Option<T>` - create a `Some` from a value; **note that calling `Some(undefined)` or `Some(null)` will return `None`**
* `None` - reference to the singleton `None` value

### Querying the inner value

* `Option<T>.isSome(): boolean`

  Returns `true` if the option is `Some`, `false` otherwise

* `Option<T>.isSomeAnd(fn: (value: T) => boolean): boolean`

  Returns `true` if the option is `Some` and calling `fn` with the inner value returns `true`, `false` otherwise
 
* `Option<T>.isNone(): boolean`

  Returns `true` if the option is `None`, `false` otherwise

* `Option<T>.isNoneOr(fn: (value: T) => boolean): boolean`

  Returns true if the option is `None` or calling `fn` with the inner value returns `true`, `false` otherwise

* `Option<T>.unwrap(): T`

  Returns the underlying value if the option is `Some`, otherwise throws an exception

* `Option<T>.expect(msg: string): T`

  Returns the underlying value if the option is `Some`, otherwise throws an exception with a custom message

* `Option<T>.unwrapOr(default: T): T`

  Returns the underlying value if the option is `Some`, otherwise returns `default`

* `Option<T>.unwrapOrElse(fn: () => T): T`

  Returns the underlying value if the option is `Some`, otherwise calls `fn` and returns its return value

* `Option<T>.filter(fn: (T) => boolean): Option<T>`

  Returns `None` if the option is `None`, otherwise calls `fn` with the inner value and returns:

  * `Some<T>` with the original wrapped value if `fn` returns true
  * `None` if `fn` returns false

* `Option<T>.match<U>(cases: { some: (value: T) => U; none: () => U }): U`

  Returns the result of calling `cases.some()` with the inner value if the option is `Some`, otherwise returns the result of calling `cases.none()`

* `Option<T>.equals(other: Option<T>): boolean`

  Returns true if both options are `Some` and their inner values are equal using the JavaScript `==` operator, or if both options are `None`

* `Option<T>.strictEquals(other: Option<T>): boolean`

  Returns true if both options are `Some` and their inner values are equal using the JavaScript `===` operator, or if both options are `None`

### Transforming options

* `Option<T>.map<U>(fn: (value: T) => U): Option<U>`

  Returns an `Option<U>` by mapping the inner value of the source option with `fn`

* `Option<T>.mapOr<U>(defaultValue: U, mapFn: (value: T) => U): Option<U>`

  Returns an option wrapping the provided `defaultValue` if the option is `None`, or calls `mapFn` with the inner value and returns a new option wrapping its return value

* `mapOrElse: <U>(defaultFn: () => U, mapFn: (value: T) => U): Option<U>`

  Returns an option wrapping the return value of `defaultFn` if the option is `None`, or calls `mapFn` with the inner value and returns a new option wrapping its return value

* `Option<T>.and<U>(other: Option<U>): Option<U>`

  Returns `None` if the source option is `None`, otherwise returns `other`

* `Option<T>.andThen<U>(fn: (value: T) => Option<U>): Option<U>`

  Returns `None` if the source option is `None`, otherwise calls `fn` with the inner value and returns the result.

* `Option<T>.or(other: Option<T>): Option<T>`

  Returns the source option if it is `Some`, otherwise returns `other`

* `Option<T>.orElse(fn: () => Option<T>): Option<T>`

  Returns the source option if it is `Some`, otherwise calls `fn` and returns the result

* `Option<T>.xor(other: Option<T>) => Option<T>`

  Returns the source option or `other` if exactly one of them is `Some`, otherwise returns `None`

* `Option<T>.flatten(): Option<T>`

  Converts from `Option<Option<T>>` to `Option<T>`. Only one level of nesting is removed.
