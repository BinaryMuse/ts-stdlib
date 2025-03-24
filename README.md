# ts-stdlib

`@binarymuse/ts-stdlib` is a set of classes, utilities, and types to make working with TypeScript a little bit nicer. These concepts can be found in many different languages, although many of the implementations here are inspired by Rust.

The library includes:

Wrapper Types:

* [`Option<T>`][option-docs] - a type that represents a value (`Some<T>`) or the absence of one (`None`)
* [`Result<T, E>`][result-docs] - a type that represents a successful result (`Ok<T>`) or an error (`Err<E>`)
* [`Rc<T>`][rc-docs] - a reference counted resource

Container Types:

* [`Deque<T>`][deque-docs] - a double-ended queue, implemented with a doubly-linked list

## Installation

```
npm install @binarymuse/ts-stdlib
# or
pnpm add @binarymuse/ts-stdlib
# or
yarn add @binarymuse/ts-stdlib
```

## Documentation

* [Library docs][library-docs]
* Wrapper types:
  * [`Option<T>`][option-docs]
  * [`Result<T, E>`][result-docs]
  * [`Rc<T>`][rc-docs]
* Container types:
  * [`Deque<T>`][deque-docs]

[library-docs]: https://binarymuse.github.io/ts-stdlib/
[option-docs]: https://binarymuse.github.io/ts-stdlib/modules/Option.html
[result-docs]: https://binarymuse.github.io/ts-stdlib/modules/Result.html
[rc-docs]: https://binarymuse.github.io/ts-stdlib/modules/Rc.html
[deque-docs]: https://binarymuse.github.io/ts-stdlib/modules/Deque.html
