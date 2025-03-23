# Rc

An `Rc<T>` (Reference Counted) type provides a way to share ownership of a resource that requires cleanup when it's no longer needed. While JavaScript has garbage collection, there are times when you need more explicit control over when a resource is cleaned up, such as:

- Managing WebSocket connections
- Controlling access to WebWorkers
- Handling cleanup of DOM elements
- Managing database connections
- Coordinating cleanup of shared resources

## Overview

To create an `Rc`, you provide both the resource and a cleanup function that will be called when the last reference is disposed:

```typescript
const connection = new WebSocket("wss://example.com");
const rc = Rc(connection, (conn) => {
  conn.close();
});

// Use the connection normally
rc.send("Hello!");

// Create another reference
const rc2 = Rc.clone(rc);

// Dispose when done - connection stays alive because rc2 exists
Rc.dispose(rc);

// Dispose last reference - connection is closed
Rc.dispose(rc2);
```

The `Rc` acts as a proxy to the underlying resource, so you can access all of its methods and properties directly. However, you must remember to dispose of every `Rc` you create, or the cleanup function will never be called.

## Weak references

Sometimes you want to reference a resource without preventing it from being cleaned up. This is where weak references come in. A weak reference won't keep the resource alive, but it can be upgraded to a strong reference when needed:

```typescript
const shared = {
  data: "important stuff",
  cleanup: () => console.log("Cleaned up!")
};

// Create the main reference
const strong = Rc(shared, (res) => res.cleanup());

// Create a weak reference
const weak = Rc.weak(strong);

// Try to use the weak reference by upgrading it
const maybeStrong = Rc.upgrade(weak);
if (maybeStrong.isSome()) {
  const newStrong = maybeStrong.unwrap();
  console.log(newStrong.data); // "important stuff"
  Rc.dispose(newStrong);
}

// Dispose the original - this will trigger cleanup
Rc.dispose(strong);

// Now the weak reference can't be upgraded
const afterDisposal = Rc.upgrade(weak);
console.log(afterDisposal.isNone()); // true
```

## Converting strong to weak references

You can convert a strong reference into a weak one using `intoWeak`. This is different from `weak` because it disposes of the original strong reference:

```typescript
const resource = {
  value: 42,
  cleanup: () => console.log("Cleaned up!")
};

const rc1 = Rc(resource, res => res.cleanup());
const rc2 = Rc.clone(rc1);

// Convert rc1 to a weak reference
const weak = Rc.intoWeak(rc1);
// rc1 is now disposed and can't be used

// Resource is still alive because rc2 exists
const upgraded = Rc.upgrade(weak);
console.log(upgraded.unwrap().value); // 42

// Disposing rc2 will cleanup the resource
Rc.dispose(rc2);
// Now weak.upgrade() would return None
```

## Common patterns

### Shared resource management

```typescript
class SharedDatabase {
  private connection: Rc<DatabaseConnection>;
  
  constructor() {
    const conn = createDatabaseConnection();
    this.connection = Rc(conn, c => c.close());
  }

  getConnection(): Rc<DatabaseConnection> {
    return Rc.clone(this.connection);
  }

  dispose() {
    Rc.dispose(this.connection);
  }
}

// Usage
const db = new SharedDatabase();

function useDatabase() {
  const conn = db.getConnection();
  try {
    conn.query("SELECT * FROM users");
  } finally {
    Rc.dispose(conn);
  }
}
```

### Singleton via upgrading weak references

```typescript
class Resource {
  private static instanceMap = new Map<string, Weak<Resource>>();

  static getInstance(id: string): Rc<Resource> {
    if (this.instanceMap.has(id)) {
      // Since `instanceMap` gets cleaned up when the last strong
      // reference is disposed (see below), we know that any weak
      // reference in the map can be successfully upgraded.
      return Rc.upgrade(this.instanceMap.get(id)!).unwrap();
    }

    const resource = new Resource(id);
    const rc = Rc(resource, () => {
      // When the last strong reference is disposed,
      // clean up the resource and remove its weak reference
      // from `instanceMap`
      this.instanceMap.delete(id);
      resource.cleanup();
    });

    // Store the weak reference so we can upgrade it if
    // other consumers call `getInstance()` while other
    // strong references still exist
    this.instanceMap.set(stateId, Rc.weak(rc));
    return rc;
  }

  private constructor(id: string) {
    // ...
  }

  public cleanup() {
    // ...
  }
}
```

## Debugging

The `Rc.inspect()` function can help you understand what's happening with your references:

```typescript
const resource = { value: 42 };
const rc = Rc(resource, () => {});
const rc2 = Rc.clone(rc);
const weak = Rc.weak(rc);

console.log(Rc.inspect(rc));
// {
//   id: 1,
//   refCount: 2,
//   weakCount: 1,
//   disposed: false,
//   innerDisposed: false
// }
```

This is particularly useful when debugging memory leaks or trying to understand why a resource isn't being cleaned up when expected.
