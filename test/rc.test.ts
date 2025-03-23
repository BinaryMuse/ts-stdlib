import { Rc } from "../src/rc";
import { test, expect, describe } from "vitest";

describe("Rc", () => {
  test("Rc basic functionality", () => {
    let disposed = false;
    const obj = {
      value: 42,
      method() {
        return this.value;
      },
    };
    const rc = Rc(obj, () => {
      disposed = true;
    });

    // Original methods and properties work
    expect(rc.value).toBe(42);
    expect(rc.method()).toBe(42);

    // Clone works the same way
    const clone = Rc.clone(rc);
    expect(clone.value).toBe(42);
    expect(clone.method()).toBe(42);

    // Disposing the last rc should dispose the inner object
    Rc.dispose(clone);
    expect(disposed).toBe(false);
    Rc.dispose(rc);
    expect(disposed).toBe(true);
  });

  test("Rc reference counting", () => {
    let disposeCount = 0;
    const obj = { value: 42 };
    const rc = Rc(obj, () => {
      disposeCount++;
    });

    const clone1 = Rc.clone(rc);
    const clone2 = Rc.clone(clone1);
    const clone3 = Rc.clone(clone2);

    // Dispose in different order
    Rc.dispose(clone2);
    expect(disposeCount).toBe(0);
    Rc.dispose(clone1);
    expect(disposeCount).toBe(0);
    Rc.dispose(clone3);
    expect(disposeCount).toBe(0);
    Rc.dispose(rc);
    expect(disposeCount).toBe(1);
  });

  test("Weak references", () => {
    let disposed = false;
    const obj = { value: 42 };
    const rc = Rc(obj, () => {
      disposed = true;
    });

    const clone = Rc.clone(rc);
    const weak = Rc.weak(clone);
    expect(disposed).toBe(false);

    // Dispose the clone that was used to create the weak reference
    Rc.dispose(clone);
    expect(disposed).toBe(false);

    // Weak references don't have access to the inner object directly
    expect(() => (weak as any).value).toThrow(
      "Weak references can only be upgraded or disposed"
    );

    // Dispose original rc to trigger cleanup
    Rc.dispose(rc);
    expect(disposed).toBe(true);

    // Try to upgrade weak reference
    const upgraded = Rc.upgrade(weak);
    expect(upgraded.isNone()).toBe(true);

    Rc.dispose(weak);
  });

  test("Weak reference upgrade", () => {
    let disposed = false;
    const obj = { value: 42 };
    const rc = Rc(obj, () => {
      disposed = true;
    });

    const weak = Rc.weak(rc);
    expect(disposed).toBe(false);

    const upgraded = Rc.upgrade(weak);
    expect(upgraded.isSome()).toBe(true);
    const strong = upgraded.unwrap();
    expect(strong.value).toBe(42);

    // Upgrade the weak reference again
    const upgraded2 = Rc.upgrade(weak);
    expect(upgraded2.isSome()).toBe(true);
    const strong2 = upgraded2.unwrap();
    expect(strong2.value).toBe(42);

    // Original rc can be disposed
    Rc.dispose(rc);
    expect(disposed).toBe(false);

    // New strong references keep object alive
    Rc.dispose(strong);
    Rc.dispose(strong2);
    expect(disposed).toBe(true);

    // Weak reference can't be upgraded after disposal
    const failedUpgrade = Rc.upgrade(weak);
    expect(failedUpgrade.isNone()).toBe(true);
  });

  test("Multiple weak references", () => {
    let disposed = false;
    const obj = { value: 42 };
    const rc = Rc(obj, () => {
      disposed = true;
    });

    const weak1 = Rc.weak(rc);
    const weak2 = Rc.weak(rc);

    // Dispose original rc to trigger cleanup
    Rc.dispose(rc);
    expect(disposed).toBe(true);

    // Try to upgrade weak references - should return None
    const upgraded1 = Rc.upgrade(weak1);
    const upgraded2 = Rc.upgrade(weak2);
    expect(upgraded1.isNone()).toBe(true);
    expect(upgraded2.isNone()).toBe(true);

    // Cleanup weak references
    Rc.dispose(weak1);
    Rc.dispose(weak2);
  });

  test("Converting last Rc to Weak", () => {
    let disposed = false;
    const obj = { value: 42 };
    const rc = Rc(obj, () => {
      disposed = true;
    });

    // Clone rc to keep it alive
    const clone = Rc.clone(rc);

    // Convert original rc to weak
    const weak = Rc.intoWeak(rc);
    expect(disposed).toBe(false);

    // Convert last rc to weak, leaving no strong references
    const weak2 = Rc.intoWeak(clone);
    expect(disposed).toBe(true);

    // Try to access weak reference - should throw
    expect(() => (weak as any).value).toThrow(
      "Weak references can only be upgraded or disposed"
    );
    expect(() => (weak2 as any).value).toThrow(
      "Weak references can only be upgraded or disposed"
    );

    // Can't upgrade weak reference after inner disposal
    const upgraded = Rc.upgrade(weak);
    expect(upgraded.isNone()).toBe(true);
  });
});
