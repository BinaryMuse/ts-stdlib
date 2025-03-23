import { None, Option, Some } from "./option";

const Marker = Symbol("Rc");
const WeakMarker = Symbol("Weak");

type RcInfo = {
  id: number;
  refCount: number;
  weakCount: number;
  disposed: boolean;
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

type Rc<T> = T & {
  [Marker]: {
    id: number;
    dispose: () => void;
    clone: () => Rc<T>;
    weak: () => Weak<T>;
    intoWeak: () => Weak<T>;
  };
};

type Weak<T> = {
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
 * Creates a new reference-counted object.
 *
 * A reference-counted object is an object that can be cloned and disposed.
 * When the last reference is disposed, the underlying object will be disposed.
 * `Rc.clone` creates a new reference to the same object. `Rc.dispose` decrements
 * the reference count.
 *
 * `Rc.weak` creates a weak reference to the object. A weak reference won't prevent
 * the underlying object from being disposed if there are no other strong references
 * remaining. You can attempt to upgrade a weak reference to a strong reference using
 * `Rc.upgrade`. If the underlying object has been disposed, `Rc.upgrade` will return
 * `None`.
 *
 * `Rc.intoWeak` can be used to convert a strong reference to a weak reference.
 * This will decrement the reference count, and if there are no other strong
 * references remaining, the underlying object will be disposed immediately.
 * Note that this does not mutate the original reference, but returns a new
 * weak reference; however, the original reference will no longer be usable, nor
 * will it keep the underlying object alive.
 *
 * ## Examples
 *
 * ```typescript
 * const obj = { value: 42, disposed: false };
 * const rc = Rc(obj, () => {
 *   obj.disposed = true;
 * });
 *
 * console.log(rc.value); // 42
 * const rc2 = Rc.clone(rc);
 * Rc.dispose(rc);
 * console.log(obj.disposed); // false
 * Rc.dispose(rc2);
 * console.log(obj.disposed); // true
 * ```
 *
 * @param object - The object to wrap.
 * @param dispose - A function to call when the last reference is disposed.
 * @returns A new reference-counted object.
 */
function Rc<T extends object>(object: T, dispose: (data: T) => void): Rc<T> {
  const id = getNextId();
  const inner = new RcInner(object, dispose);
  map.set(id, inner);
  return createProxy(id, inner) as Rc<T>;
}

Rc.clone = function <T>(rc: Rc<T>): Rc<T> {
  return (rc as any)[Marker].clone();
};

Rc.dispose = function <T>(rc: Rc<T> | Weak<T>) {
  if (Marker in rc) {
    (rc as any)[Marker].dispose();
  } else {
    (rc as any)[WeakMarker].dispose();
  }
};

Rc.weak = function <T>(rc: Rc<T>): Weak<T> {
  return (rc as any)[Marker].weak();
};

Rc.intoWeak = function <T>(rc: Rc<T>): Weak<T> {
  return (rc as any)[Marker].intoWeak();
};

Rc.upgrade = function <T>(weak: Weak<T>): Option<Rc<T>> {
  return (weak as any)[WeakMarker].upgrade();
};

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
