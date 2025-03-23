# Option

An `Option<T>` is a value that represents the existance (or lack thereof) of another value. You can think of it a bit like `T | null` or `T | undefined`. While TypeScript can enforce checking to ensure you don't use a `null` or `undefined` value, `Option` provides some additional functionality that can make it a nice alternative.

To create an `Option` wrapping some value of type `T` (written as `Option<T>`), use the `Some` function. For example: `const opt = Some(value)`. If you want to create an `Option` representing the lack of a value, use `None`. For example: `const missing = None`.

To get to the wrapped value, call `unwrap()` on the `Option`. If the option is `None`, then `unwrap()` will throw an error; thus, it's important to check to see if an option is `Some` or `None` before accessing the value, or use a method that provides a default value in the case of `None`, like `unwrapOr(defaultValue)`.

`Option` provides a number of methods for changing an `Option` into another value and controlling code flow based on its value. By using these methods, we can skip most of the null checking that TypeScript would usually require of us.

For example, here's an interface representing a theoretical TypeScript type:

```typescript
interface Tree {
  static getById(id): Tree | null;
  static create(id): Tree;

  public getNode<T>(nodeId): Node<T> | null;
}

interface Node<T> {
  public data: T | null
}
```

Here's a typical example of how one might interact with this API:

```typescript
function getNodeData<T>(id: string, nodeId: string) {
  let tree = Tree.getById(id);
  if (!tree) {
    tree = Tree.create(id);
  }

  let node = tree.getNode<T>(nodeId);

  if (node && node.data) {
    return node.data;
  } else {
    return defaultData;
  }
}
```

Here's the same example, using an API that returns `Option`s:

```typescript
interface Tree {
  static getById(id): Option<Tree>;
  static create(id): Tree;

  public getNode<T>(nodeId): Option<Node<T>>;
}

interface Node<T> {
  public data: Option<T>
}

function getNodeData<T>(id: string, nodeId: string): T {
  // Start with an `Option<Tree>`
  return Tree.getById(id)
    // If `None`, return `Some(Tree.create(...))` instead
    .orElse(() => Some(Tree.create(id)))
    // Turn the `Option<Tree>` into an `Option<Node>`
    .andThen(tree => tree.getNode<T>(nodeId))
    // Turn the `Option<Node>` into `Option<T>`
    .map(node => node.data)
    // If `Some`, return the inner value, otherwise return `defaultData`
    .unwrapOr(defaultData);
}
```

Since calling `Some(value)` when `value` is `null` or `undefined` returns `None`, we can easily wrap external APIs that don't use options:

```typescript
interface Tree {
  static getById(id): Tree | null;
  static create(id): Tree;

  public getNode<T>(nodeId): Node<T> | null;
}

interface Node<T> {
  public data: T | null
}

function getNodeData<T>(id: string, nodeId: string): T {
  // Start with an `Option<Tree>`; this will be `None` if `Tree.getById()` returns `null`
  return Some(Tree.getById(id))
    // If `None`, return `Some(Tree.create(...))` instead
    .orElse(() => Some(Tree.create(id)))
    // Turn the `Option<Tree>` into an `Option<Node>`; this will be `None` if `getNode()` returns `null`
    .map(tree => tree.getNode<T>(nodeId))
    // Turn the `Option<Node>` into `Option<T>`
    .map(node => node.data)
    // If `Some`, return the inner value, otherwise return `defaultData`
    .unwrapOr(defaultData);
}
```
