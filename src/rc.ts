/**
 * ```typescript
 * import { Rc, Weak, RcInfo } from "@binarymuse/ts-stdlib";
 * ```
 *
 * > *(See {@link Rc} for the `Rc` API)*
 *
 * ## Overview
 *
 * A reference-counted object provides a way to manage shared resources that need cleanup
 * when they're no longer in use. There are two types of references:
 *
 * 1. Strong references (`Rc<T>`):
 *    - Created with `Rc()` or `Rc.clone()`
 *    - Keep the resource alive as long as at least one strong reference exists
 *    - Must be explicitly disposed with `Rc.dispose()` when no longer needed
 *
 * 2. Weak references (`Weak<T>`):
 *    - Created with `Rc.weak()` or `Rc.intoWeak()`
 *    - Don't prevent the resource from being cleaned up
 *    - Can be upgraded to strong references with `Rc.upgrade()` if the resource is still alive
 *
 * When the last strong reference to a resource is disposed, the resource's cleanup
 * function will be called automatically. Weak references can still exist at this point,
 * but they can no longer be upgraded to strong references.
 *
 * ## Example:
 *
 * ```typescript
 * const resource = Rc(connection, conn => conn.close());
 *
 * // Creates another strong reference
 * const ref2 = Rc.clone(resource);
 * // Creates a weak reference
 * const weak = Rc.weak(resource);
 *
 * // Resource stays alive (ref2 exists)
 * Rc.dispose(resource);
 * // Returns Some(Rc<T>) (resource still alive)
 * const upgraded = Rc.upgrade(weak);
 * // Resource is cleaned up
 * Rc.dispose(ref2);
 * // Returns None (resource disposed)
 * const failed = Rc.upgrade(weak);
 * ```
 *
 * The `intoWeak` function is a special case that:
 * 1. Creates a new weak reference
 * 2. Disposes the original strong reference
 * 3. Returns the weak reference
 *
 * This is equivalent to, but more efficient than:
 * ```typescript
 * const weak = Rc.weak(resource);
 * Rc.dispose(resource);
 * return weak;
 * ```
 *
 * @see {@link Rc} for the `Rc` API
 *
 * @module Rc
 * @group rc
 */
import { None, Option, Some } from "./option";

const Marker = Symbol("Rc");
const WeakMarker = Symbol("Weak");

/**
 * Information about a reference-counted object, returned by {@link Rc.inspect | `Rc.inspect()`}.
 *
 * @group rc
 */
type RcInfo = {
  /**
   * The internal ID of the Rc.
   * @group Properties
   */
  id: number;
  /**
   * The number of strong references to the Rc.
   * @group Properties
   */
  refCount: number;
  /**
   * The number of weak references to the Rc.
   * @group Properties
   */
  weakCount: number;
  /**
   * Whether the Rc has been disposed.
   * @group Properties
   */
  disposed: boolean;
  /**
   * Whether the inner object has been disposed.
   * @group Properties
   */
  innerDisposed: boolean;
};

class RcInner<T> {
  public refCount: number;
  public weakCount: number;
  public data: Option<T>;
  public disposeFn: (data: T) => void;
  public disposed: boolean = false;

  constructor(data: T, dispose: (data: T) => void) {
    this.refCount = 1;
    this.weakCount = 0;
    this.data = Some(data);
    this.disposeFn = dispose;
  }

  public incrementCount() {
    if (this.disposed) {
      throw new Error("Cannot increment count of disposed Rc");
    }

    this.refCount++;
  }

  public decrementCount() {
    if (this.disposed) {
      throw new Error("Cannot decrement count of disposed Rc");
    }

    this.refCount--;
  }

  public incrementWeakCount() {
    if (this.disposed) {
      throw new Error("Cannot increment weak count of disposed Rc");
    }

    this.weakCount++;
  }

  public decrementWeakCount() {
    if (this.disposed) {
      throw new Error("Cannot decrement weak count of disposed Rc");
    }

    this.weakCount--;
  }

  public dispose() {
    if (!this.disposed) {
      this.disposeFn.call(null, this.data.unwrap());
      this.disposed = true;
      this.refCount = 0;
      this.weakCount = 0;
      this.data = None;
      this.disposeFn = () => {};
    }
  }
}

let id = 0;
function getNextId(): number {
  id += 1;
  return id;
}

const map = new Map<number, RcInner<any>>();

/**
 * A strong reference to a reference-counted object.
 * @typeParam T - The type of the inner object.
 * @group rc
 */
type Rc<T> = T & {
  /**
   * Internal marker for Rc management.
   * @internal
   * @group Properties
   */
  [Marker]: {
    id: number;
    dispose: () => void;
    clone: () => Rc<T>;
    weak: () => Weak<T>;
    intoWeak: () => Weak<T>;
  };
};

/**
 * A weak reference to a reference-counted object.
 * @typeParam T - The type of the inner object.
 * @group rc
 */
type Weak<T> = {
  /**
   * Internal marker for Weak management.
   * @internal
   * @group Properties
   */
  [WeakMarker]: {
    id: number;
    dispose: () => void;
    upgrade: () => Option<Rc<T>>;
  };
};

function createWeakProxy<T extends object>(id: number): Weak<T> {
  const inner = map.get(id)!;
  let isDisposed = false;

  return new Proxy({} as Weak<T>, {
    get(_target, prop, _receiver) {
      if (prop === WeakMarker) {
        return {
          id,
          refCount: inner.refCount,
          weakCount: inner.weakCount,
          innerDisposed: inner.disposed,
          disposed: isDisposed,
          innerRc: inner,
          dispose: () => {
            if (isDisposed) {
              throw new Error("Weak reference already disposed");
            }
            if (inner.disposed) {
              isDisposed = true;
              return;
            }
            inner.decrementWeakCount();
            isDisposed = true;
          },
          upgrade: (): Option<Rc<T>> => {
            if (isDisposed) {
              return None;
            }
            if (!map.has(id)) {
              return None;
            }
            if (inner.disposed) {
              return None;
            }
            inner.incrementCount();
            return Some(createProxy(id, inner) as Rc<T>);
          },
        };
      }
      throw new Error("Weak references can only be upgraded or disposed");
    },
    has(_target, prop) {
      if (prop === WeakMarker) {
        return true;
      }
      return false;
    },
  });
}

function createProxy<T extends object>(id: number, inner: RcInner<T>) {
  let isDisposed = false;

  return new Proxy(inner.data.unwrap(), {
    get(target, prop, _receiver) {
      if (prop === Marker) {
        return {
          id,
          refCount: inner.refCount,
          weakCount: inner.weakCount,
          innerDisposed: inner.disposed,
          disposed: isDisposed,
          innerRc: inner,
          dispose: () => {
            if (isDisposed) {
              throw new Error("Rc already disposed");
            }
            inner.decrementCount();
            if (inner.refCount === 0) {
              try {
                inner.dispose();
              } catch (_e) {}
              map.delete(id);
            }
            isDisposed = true;
          },
          clone: (): Rc<T> => {
            if (isDisposed) {
              throw new Error("Cannot clone disposed Rc");
            }
            inner.incrementCount();
            return createProxy(id, inner) as Rc<T>;
          },
          weak: (): Weak<T> => {
            if (isDisposed) {
              throw new Error("Cannot create weak reference from disposed Rc");
            }
            inner.incrementWeakCount();
            return createWeakProxy(id) as Weak<T>;
          },
          intoWeak: (): Weak<T> => {
            if (isDisposed) {
              throw new Error("Cannot convert disposed Rc to weak reference");
            }
            inner.decrementCount();
            inner.incrementWeakCount();
            if (inner.refCount === 0) {
              try {
                inner.dispose();
              } catch (_e) {}
              map.delete(id);
            }
            isDisposed = true;
            return createWeakProxy(id) as Weak<T>;
          },
        };
      }
      if (isDisposed) {
        throw new Error("Rc accessed after disposal");
      }
      return Reflect.get(target, prop, target);
    },
    has(target, prop) {
      if (prop === Marker) {
        return true;
      }
      return Reflect.has(target, prop);
    },
  });
}

/**
 * Creates a new strong reference to an object.
 *
 * @param object - The object to wrap.
 * @param dispose - A function to call when the last reference is disposed.
 * @returns A new reference-counted object.
 *
 * @group Static Methods
 */
function Rc<T extends object>(object: T, dispose: (data: T) => void): Rc<T> {
  const id = getNextId();
  const inner = new RcInner(object, dispose);
  map.set(id, inner);
  return createProxy(id, inner) as Rc<T>;
}

/**
 * Clones a reference-counted object.
 *
 * @param rc - The reference-counted object to clone.
 * @returns A new reference-counted object that is a clone of the original.
 *
 * @group Static Methods
 */
Rc.clone = function <T>(rc: Rc<T>): Rc<T> {
  return (rc as any)[Marker].clone();
};

/**
 * Disposes a reference-counted object.
 *
 * @param rc - The reference-counted object to dispose.
 *
 * @group Static Methods
 */
Rc.dispose = function <T>(rc: Rc<T> | Weak<T>) {
  if (Marker in rc) {
    (rc as any)[Marker].dispose();
  } else {
    (rc as any)[WeakMarker].dispose();
  }
};

/**
 * Creates a weak reference to a reference-counted object.
 *
 * @param rc - The reference-counted object to create a weak reference to.
 * @returns A weak reference to the reference-counted object.
 *
 * @group Static Methods
 */
Rc.weak = function <T>(rc: Rc<T>): Weak<T> {
  return (rc as any)[Marker].weak();
};

/**
 * Creates a weak reference to a reference-counted object, disposing of
 * the original reference in the process.
 *
 * @param rc - The reference-counted object to create a weak reference to.
 * @returns A weak reference to the reference-counted object.
 *
 * @group Static Methods
 */
Rc.intoWeak = function <T>(rc: Rc<T>): Weak<T> {
  return (rc as any)[Marker].intoWeak();
};

/**
 * Attempts to upgrade a weak reference to a strong reference.
 *
 * @param weak - The weak reference to upgrade.
 * @returns A strong reference to the reference-counted object, or `None` if
 * the underlying object has been disposed.
 *
 * @group Static Methods
 */
Rc.upgrade = function <T>(weak: Weak<T>): Option<Rc<T>> {
  return (weak as any)[WeakMarker].upgrade();
};

/**
 * Inspects a reference-counted object or weak reference.
 *
 * @param rc - The reference-counted object or weak reference to inspect.
 * @returns Information about the reference-counted object or weak reference.
 *
 * @group Static Methods
 */
Rc.inspect = function <T>(rc: Rc<T> | Weak<T>): RcInfo {
  let api;
  if (Marker in rc) {
    api = (rc as any)[Marker];
  } else {
    api = (rc as any)[WeakMarker];
  }

  return {
    id: api.id,
    refCount: api.refCount,
    weakCount: api.weakCount,
    disposed: api.disposed,
    innerDisposed: api.innerDisposed,
  };
};

export { Rc };
export type { Weak, RcInfo };
