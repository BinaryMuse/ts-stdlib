import { describe, it, expect } from "vitest";
import { Option, Some, None } from "../src/";

describe("Option", () => {
  it("isSome and isNone", () => {
    const some = Some(1);
    const none = None;

    expect(some.isSome()).toBe(true);
    expect(some.isNone()).toBe(false);
    expect(none.isSome()).toBe(false);
    expect(none.isNone()).toBe(true);

    expect(Some(undefined).isSome()).toBe(false);
    expect(Some(null).isSome()).toBe(false);
  });

  it("isSomeAnd", () => {
    const some = Some(1);
    const none = None;

    expect(some.isSomeAnd((x) => x > 0)).toBe(true);
    expect(some.isSomeAnd((x) => x < 0)).toBe(false);
    expect(none.isSomeAnd((x) => x > 0)).toBe(false);
  });

  it("isNoneOr", () => {
    const some = Some(1);
    const none = None;

    expect(some.isNoneOr((x) => x > 0)).toBe(true);
    expect(some.isNoneOr((x) => x < 0)).toBe(false);
    expect(none.isNoneOr((x) => x > 0)).toBe(true);
    expect(none.isNoneOr((x) => x < 0)).toBe(true);
  });

  it("unwrap", () => {
    const some = Some(1);
    const none = None;

    expect(some.unwrap()).toBe(1);
    expect(() => none.unwrap()).toThrow();
  });

  it("unwrapOr", () => {
    const some = Some(1);
    const none = None;

    expect(some.unwrapOr(2)).toBe(1);
    expect(none.unwrapOr(2)).toBe(2);
  });

  it("unwrapOrElse", () => {
    const some = Some(1);
    const none = None;

    expect(some.unwrapOrElse(() => 3)).toBe(1);
    expect(none.unwrapOrElse(() => 3)).toBe(3);
  });

  it("expect", () => {
    const some = Some(1);
    const none = None;

    expect(some.expect("error")).toBe(1);
    expect(() => none.expect("no value")).toThrow("no value");
  });

  it("map", () => {
    const some = Some(1);
    const none: Option<number> = None;

    expect(some.map((x) => x + 1).unwrap()).toEqual(2);
    expect(none.map((x) => x + 1)).toEqual(None);

    expect(some.map((_x) => null)).toEqual(None);
  });

  it("mapOr", () => {
    const some = Some(1);
    const none: Option<number> = None;

    expect(some.mapOr(5, (x) => x + 1).unwrap()).toEqual(2);
    expect(none.mapOr(5, (x) => x + 1).unwrap()).toEqual(5);

    expect(some.mapOr(5, (_x) => null)).toEqual(None);
  });

  it("mapOrElse", () => {
    const some = Some(1);
    const none: Option<number> = None;

    const mappedSome = some.mapOrElse(
      () => 5,
      (x) => x + 1
    );

    const mappedNone = none.mapOrElse(
      () => 5,
      (x) => x + 1
    );

    expect(mappedSome.unwrap()).toEqual(2);
    expect(mappedNone.unwrap()).toEqual(5);

    expect(
      none.mapOrElse(
        () => null,
        (x) => x + 1
      )
    ).toEqual(None);
  });

  it("and", () => {
    const some = Some(1);
    const none: Option<number> = None;

    expect(some.and(Some(2)).unwrap()).toEqual(2);
    expect(none.and(Some(2))).toEqual(None);
  });

  it("andThen", () => {
    const some = Some(1);
    const none: Option<number> = None;

    expect(some.andThen((x) => Some(x + 1)).unwrap()).toEqual(2);
    expect(none.andThen((x) => Some(x + 1))).toEqual(None);
  });

  it("or", () => {
    const some = Some(1);
    const none: Option<number> = None;

    expect(some.or(Some(2)).unwrap()).toEqual(1);
    expect(none.or(Some(2)).unwrap()).toEqual(2);
  });

  it("orElse", () => {
    const some = Some(1);
    const none: Option<number> = None;

    expect(some.orElse(() => Some(2)).unwrap()).toEqual(1);
    expect(none.orElse(() => Some(2)).unwrap()).toEqual(2);
  });

  it("xor", () => {
    let x = Some(1);
    let y = None;

    expect(x.xor(y).unwrap()).toEqual(1);
    expect(y.xor(x).unwrap()).toEqual(1);

    x = Some(1);
    y = Some(2);

    expect(x.xor(y)).toEqual(None);
    expect(y.xor(x)).toEqual(None);

    x = None;
    y = None;

    expect(x.xor(y)).toEqual(None);
    expect(y.xor(x)).toEqual(None);
  });

  it("filter", () => {
    const some = Some(1);
    const none: Option<number> = None;

    expect(some.filter((x) => x > 0).unwrap()).toEqual(1);
    expect(some.filter((x) => x < 0)).toEqual(None);
    expect(none.filter((x) => x > 0)).toEqual(None);
  });

  it("flatten", () => {
    const some = Some(Some(1));
    const none: Option<Option<number>> = None;

    expect(some.flatten().unwrap()).toEqual(1);
    expect(none.flatten()).toEqual(None);

    // flatten only unwraps one level of nesting
    const doubleNested = Some(Some(Some(1)));
    expect(doubleNested.flatten().unwrap().isSome()).toBe(true);
  });

  it("okOr", () => {
    const some = Some(1);
    const none: Option<number> = None;

    expect(some.okOr("error").isOk()).toBe(true);
    expect(some.okOr("error").unwrap()).toEqual(1);
    expect(none.okOr("error").isErr()).toBe(true);
    expect(none.okOr("error").unwrapErr()).toEqual("error");
  });

  it("okOrElse", () => {
    const some = Some(1);
    const none: Option<number> = None;

    expect(some.okOrElse(() => "error").isOk()).toBe(true);
    expect(some.okOrElse(() => "error").unwrap()).toEqual(1);
    expect(none.okOrElse(() => "error").isErr()).toBe(true);
    expect(none.okOrElse(() => "error").unwrapErr()).toEqual("error");
  });

  it("match", () => {
    const some = Some(1);
    const none: Option<number> = None;

    expect(some.match({ some: (x) => x + 1, none: () => 0 })).toEqual(2);
    expect(none.match({ some: (x) => x + 1, none: () => 0 })).toEqual(0);
  });

  it("equals", () => {
    const some = Some(1);
    const none: Option<number> = None;

    expect(some.equals(Some(1))).toEqual(true);
    expect(none.equals(Some(1))).toEqual(false);

    const nested1 = Some(Some(1));
    const nested2 = Some(Some(1));

    expect(nested1.equals(nested2)).toEqual(true);
  });

  it("strictEquals", () => {
    const obj = {};
    const some = Some(obj);
    const none: Option<typeof obj> = None;

    expect(some.strictEquals(Some(obj))).toEqual(true);
    expect(none.strictEquals(Some(obj))).toEqual(false);

    const nested1 = Some(Some(obj));
    const nested2 = Some(Some(obj));

    expect(nested1.strictEquals(nested2)).toEqual(true);
  });
});
