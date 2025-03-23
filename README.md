# ts-stdlib

`@binarymuse/ts-stdlib` is a set of classes, utilities, and types to make working with TypeScript a little bit nicer. These concepts can be found in many different languages, although many of the implementations here are inspired by Rust.

The library includes:

* [`Option<T>`](#optiont) - a type that represents a value (`Some<T>`) or the absence of one (`None`)
* [`Result<T, E>`](#resultt-e) - a type that represents a successful result (`Ok<T>`) or an error (`Err<E>`)
* [`Rc<T>`](#rct) - a reference counted resource

## Installation

```
npm install @binarymuse/ts-stdlib
# or
pnpm add @binarymuse/ts-stdlib
# or
yarn add @binarymuse/ts-stdlib
```

## `Option<T>`

```typescript
import { Option, Some, None } from "@binarymuse/ts-stdlib"
```

For a longer guide on using `Option<T>`, [see guides/option.md](guides/option.md).

An `Option<T>` has two variants:

* `Some<T>`, representing the existance of the inner value
* `None`, representing the absence of an inner value

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

  Returns true if both options are `Some` and their inner values are equal using the JavaScript `==` operator, or if both options are `None`. As a special case, if both options are `Some` and their inner values are also `Some` or another library type (like `Result`), their inner values are compared with `equals()`.

* `Option<T>.strictEquals(other: Option<T>): boolean`

  Returns true if both options are `Some` and their inner values are equal using the JavaScript `===` operator, or if both options are `None`. As a special case, if both options are `Some` and their inner values are also `Some` or another library type (like `Result`), their inner values are compared with `strictEquals()`.

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

## `Result<T, E>`

```typescript
import { Result, Ok, Err } from "@binarymuse/ts-stdlib"
```

For a longer guide on using `Result<T, E>`, [see guides/result.md](guides/result.md).

A `Result<T, E>` has two variants:

* `Ok<T>`, representing a successful result containing a value of type `T`
* `Err<E>`, representing an error containing a value of type `E`

### Creating a result

* `Ok<T, E = never>(value: T): Result<T, E>` - create an `Ok` result containing a success value
* `Err<E, T = never>(error: E): Result<T, E>` - create an `Err` result containing an error value

Since TypeScript can't infer the type of `E` (in the case of `Ok`) or the type of `T` (in the case of `Err`), it can be useful to explicitly define these types when creating the `Result`:

```typescript
const result1: Result<ValueType, ErrorType> = Ok(value);
const result2: Result<ValueType, ErrorType> = Err(error);
```

### Querying the result

* `Result<T, E>.isOk(): boolean`

  Returns `true` if the result is `Ok`, `false` otherwise

* `Result<T, E>.isOkAnd(fn: (value: T) => boolean): boolean`

  Returns `true` if the result is `Ok` and calling `fn` with the inner value returns `true`, `false` otherwise

* `Result<T, E>.isErr(): boolean`

  Returns `true` if the result is `Err`, `false` otherwise

* `Result<T, E>.isErrAnd(fn: (error: E) => boolean): boolean`

  Returns `true` if the result is `Err` and calling `fn` with the error value returns `true`, `false` otherwise

* `Result<T, E>.unwrap(): T`

  Returns the underlying value if the result is `Ok`, otherwise throws an exception

* `Result<T, E>.unwrapOr(defaultValue: T): T`

  Returns the underlying value if the result is `Ok`, otherwise returns `defaultValue`

* `Result<T, E>.unwrapOrElse(fn: () => T): T`

  Returns the underlying value if the result is `Ok`, otherwise calls `fn` and returns its return value

* `Result<T, E>.unwrapErr(): E`

  Returns the error value if the result is `Err`, otherwise throws an exception

* `Result<T, E>.expect(msg: string): T`

  Returns the underlying value if the result is `Ok`, otherwise throws an exception with the provided message

* `Result<T, E>.expectErr(msg: string): E`

  Returns the error value if the result is `Err`, otherwise throws an exception with the provided message

* `Result<T, E>.equals(other: Result<T, E>): boolean`

  Returns true if both results are `Ok` and their inner values are equal using the JavaScript `==` operator, or if both results are `Err` and their error values are equal using the JavaScript `==` operator. As a special case, if both results contain inner values that are also `Result` or `Option` types, their inner values are compared with `equals()`.

* `Result<T, E>.strictEquals(other: Result<T, E>): boolean`

  Returns true if both results are `Ok` and their inner values are equal using the JavaScript `===` operator, or if both results are `Err` and their error values are equal using the JavaScript `===` operator. As a special case, if both results contain inner values that are also `Result` or `Option` types, their inner values are compared with `strictEquals()`.

### Transforming results

* `Result<T, E>.map<U>(fn: (value: T) => U): Result<U, E>`

  Returns a `Result<U, E>` by mapping the success value of the source result with `fn`

* `Result<T, E>.mapOr<U>(defaultValue: U, fn: (value: T) => U): Result<U, E>`

  Returns a result wrapping the provided `defaultValue` if the source result is `Err`, or calls `fn` with the source result's success value and returns a new result wrapping its return value

* `Result<T, E>.mapOrElse<U>(defaultFn: () => U, mapFn: (value: T) => U): Result<U, E>`

  Returns a result wrapping the return value of `defaultFn` if the source result is `Err`, or calls `mapFn` with the source result's success value and returns a new result wrapping its return value

* `Result<T, E>.mapErr<U>(fn: (error: E) => U): Result<T, U>`

  Returns a `Result<T, U>` by mapping the error value of the source result with `fn`

* `Result<T, E>.and<U>(other: Result<U, E>): Result<U, E>`

  Returns `other` if the source result is `Ok`, otherwise returns the source result's error

* `Result<T, E>.andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>`

  Returns the error if the source result is `Err`, otherwise calls `fn` with the success value and returns the result

* `Result<T, E>.or<U>(other: Result<U, E>): Result<U, E>`

  Returns the source result if it is `Ok`, otherwise returns `other`

* `Result<T, E>.orElse<U>(fn: () => Result<U, E>): Result<U, E>`

  Returns the source result if it is `Ok`, otherwise calls `fn` and returns the result

* `Result<T, E>.flatten(): Result<T, E>`

  Converts from `Result<Result<T, E>, E>` to `Result<T, E>`. Only one level of nesting is removed.

### Inspecting results

* `Result<T, E>.inspect(fn: (value: T) => void): Result<T, E>`

  Calls `fn` with the success value if the result is `Ok`, otherwise does nothing. Returns the original result.

* `Result<T, E>.inspectErr(fn: (error: E) => void): Result<T, E>`

  Calls `fn` with the error value if the result is `Err`, otherwise does nothing. Returns the original result.

### Converting to options

* `Result<T, E>.ok(): Option<T>`

  Converts the `Result<T, E>` into an `Option<T>`, mapping `Ok(v)` to `Some(v)` and `Err(_)` to `None`

* `Result<T, E>.err(): Option<E>`

  Converts the `Result<T, E>` into an `Option<E>`, mapping `Ok(_)` to `None` and `Err(e)` to `Some(e)`

## `Rc<T>`

```typescript
import { Rc, Weak } from "@binarymuse/ts-stdlib"
```

For a longer guide on using `Rc<T>`, [see guides/rc.md](guides/rc.md).

An `Rc<T>` is a reference-counted object. Since JavaScript uses garbage collection and doesn't have destructors, this type isn't as useful as it is in languages like Rust. However, there are situations where they can be useful.

### Creating an `Rc`

To create an `Rc<T>`, use the `Rc(resource: T, cleanup: (res: T) => void)` function. This will return an `Rc<T>`, which has access to all the same methods and properties as the original resource. Internally, this is managed using Proxies, so your JavaScript environment must support them in order to use `Rc`.

Since an `Rc` in JavaScript is only useful in situations where the underlying resource has some cleanup method that needs to be called before it is garbage collected, the second argument to `Rc()` is a function that takes the wrapped value and does any appropriate cleanup.

To create a copy of a reference, incrementing the internal counter, you can use `Rc.clone(rc)`. To clean up an `Rc`, potentially invoking the cleanup function (if it's the last reference of that particular resource), call `Rc.dispose(rc)`. **If you don't call `Rc.dispose()` for every `Rc` created, the underlying resource will never be cleaned up.**

### Weak references

At times, it's useful to create references to a resource that can be used to access the resource, but that won't keep the resource alive if all the other references are disposed. This is known as a "weak" reference (whereas `Rc` is a "strong" reference). Create a weak reference from a strong one by passing it to `Rc.weak(rc)` or `Rc.intoWeak(rc)`.

To be useful, a weak reference must be able to be turned back into a strong reference. You can do this with `Rc.upgrade(weak)`, getting an `Option<Rc<T>>`. However, since weak references don't keep a resource from being cleaned up, it's possible that the resource is already disposed (due to all the strong references already being disposed). In this case, `Rc.upgrade(weak)` will return `None`.

### API

Since an `Rc` exposes all the methods and properties of its wrapped resource, all the methods are static functions on `Rc` itself.

* `Rc<T extends object>(resource: T, cleanup: (res: T) => void): Rc<T>`

  Creates a new strong reference-counted resource wrapping `resource`. When the last strong reference is disposed, the cleanup function is run.

* `Rc.clone<T>(rc: Rc<T>): Rc<T>`

  Creates a copy of the `Rc`, incrementing its internal reference count by 1. Both the original and newly-returned `Rc` must be `dispose()`d before the resource will be disposed.

* `Rc.dispose<T>(rc: Rc<T> | Weak<T>)`

  Disposes of an `Rc`, decrementing its internal reference count by 1, and cleaning up the underlying resource if the counter reaches 0. `Weak` references won't keep the underlying resource alive (see `Rc.weak()`), so they don't strictly need to be disposed, but they can still be passed to `Rc.dispose()`.

  After an `Rc` or a `Weak` has been `dispose()`d, it can no longer be used, and trying to access any of the exposed methods or properties from the wrapped resource will throw an error. Passing the `Rc` to the `Rc.*` methods (except `inspect()`) will also throw.

* `Rc.weak<T>(rc: Rc<T>): Weak<T>`

  Creates a `Weak<T>`, known as a weak reference, from the original `Rc`, leaving the original intact. A weak reference won't keep the underlying resource from being disposed; that is, if all the strong references (`Rc<T>`s) are disposed, the resource will be cleaned up, even if there are still `Weak<T>` references to the resource that haven't been disposed.

  A `Weak<T>` can be "upgraded" to a strong `Rc<T>` via the `Rc.upgrade()` function.

* `Rc.intoWeak<T>(rc: Rc<T>): Weak<T>`

  Returns a new weak reference from the strong reference, just like `weak()`, but it additionally disposes of the original, strong reference, which can no longer be used — effectively "turning" the strong reference into a weak one.

  If the reference being converted into a weak reference is the last strong reference for a resource, the resource will be immediately disposed, since the newly-created weak reference doesn't keep the resource alive.

* `Rc.upgrade<T>(weak: Weak<T>): Option<Rc<T>>`

  Upgrading a `Weak<T>` attempts to create a new `Rc<T>` with the same underlying resource. If the resource has been cleaned up, due to all the strong references being disposed already, the function will return `None`. If the resource is still alive, it will return `Some<Rc<T>>`.

* `Rc.inspect<T>(rc: Rc<T> | Weak<T>): RcInfo`

  Returns an object with information about the `Rc`, useful for debugging. `RcInfo` has the following properties:

  * `id` - the internal ID of the `Rc`
  * `refCount` - the number of strong references to the resource left un-disosed
  * `weakCount` - the number of weak references to the resource left un-disposed
  * `disposed` - `true` if this specific `Rc` or `Weak` instance has been disposed, `false` otherwise
  * `innerDisposed` - `true` if the wrapped resource has been disposed, `false` otherwise
