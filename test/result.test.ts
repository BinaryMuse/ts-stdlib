import { describe, it, expect } from "vitest";
import { Result, Ok, Err, Some } from "../src/";

describe("Result", () => {
  it("isOk and isErr", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.isOk()).toBe(true);
    expect(ok.isErr()).toBe(false);
    expect(err.isOk()).toBe(false);
    expect(err.isErr()).toBe(true);
  });

  it("isOkAnd and isErrAnd", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.isOkAnd((x) => x === 1)).toBe(true);
    expect(err.isOkAnd((x) => x === 1)).toBe(false);

    expect(ok.isErrAnd((x) => x === "error")).toBe(false);
    expect(err.isErrAnd((x) => x === "error")).toBe(true);
  });

  it("unwrap", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.unwrap()).toBe(1);
    expect(() => err.unwrap()).toThrow();
  });

  it("unwrapOr", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.unwrapOr(2)).toBe(1);
    expect(err.unwrapOr(2)).toBe(2);
  });

  it("unwrapOrElse", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.unwrapOrElse(() => 2)).toBe(1);
    expect(err.unwrapOrElse(() => 2)).toBe(2);
  });

  it("unwrapErr", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(() => ok.unwrapErr()).toThrow("1");
    expect(err.unwrapErr()).toBe("error");
  });

  it("expect", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.expect("error")).toBe(1);
    expect(() => err.expect("error")).toThrow("error");
  });

  it("expectErr", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(() => ok.expectErr("no error")).toThrow("no error");
    expect(err.expectErr("error")).toBe("error");
  });

  it("and", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.and(Ok(2)).unwrap()).toBe(2);
    expect(err.and(Ok(2)).isErr()).toBe(true);
  });

  it("andThen", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.andThen((x) => Ok(x + 1)).unwrap()).toBe(2);
    expect(err.andThen((x) => Ok(x + 1)).isErr()).toBe(true);
  });

  it("or", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.or(Ok(2)).unwrap()).toBe(1);
    expect(err.or(Ok(2)).unwrap()).toBe(2);
  });

  it("orElse", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.orElse(() => Ok(2)).unwrap()).toBe(1);
    expect(err.orElse(() => Ok(2)).unwrap()).toBe(2);
  });

  it("map", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.map((x) => x + 1).unwrap()).toBe(2);
    expect(err.map((x) => x + 1).isErr()).toBe(true);
  });

  it("mapOr", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.mapOr(5, (x) => x + 1).unwrap()).toBe(2);
    expect(err.mapOr(5, (x) => x + 1).unwrap()).toBe(5);
  });

  it("mapOrElse", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(
      ok
        .mapOrElse(
          () => 5,
          (x) => x + 1
        )
        .unwrap()
    ).toBe(2);
    expect(
      err
        .mapOrElse(
          () => 5,
          (x) => x + 1
        )
        .unwrap()
    ).toBe(5);
  });

  it("mapErr", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.mapErr((x) => x + "error").isErr()).toBe(false);
    expect(err.mapErr((x) => x + "error").unwrapErr()).toBe("errorerror");
  });

  it("flatten", () => {
    const ok: Result<Result<number, string>, string> = Ok(Ok(1));
    const err: Result<Result<number, string>, string> = Err("error");

    expect(ok.flatten().unwrap()).toBe(1);
    expect(err.flatten().isErr()).toBe(true);

    const nested = Ok(Ok(Ok(1)));
    expect(nested.flatten().unwrap().isOk()).toBe(true);

    const okErr = Ok(Err("error"));
    expect(okErr.flatten().isErr()).toBe(true);
  });

  it("inspect", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    let called = false;
    ok.inspect((_x) => (called = true));
    expect(called).toBe(true);

    called = false;
    err.inspectErr((_x) => (called = true));
    expect(called).toBe(true);
  });

  it("ok and err", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.ok().unwrap()).toEqual(1);
    expect(ok.err().isNone()).toEqual(true);
    expect(err.err().unwrap()).toEqual("error");
    expect(err.ok().isNone()).toEqual(true);
  });

  it("equals", () => {
    const ok: Result<number, string> = Ok(1);
    const err: Result<number, string> = Err("error");

    expect(ok.equals(Ok(1))).toEqual(true);
    expect(ok.equals(Err("error"))).toEqual(false);
    expect(err.equals(Ok(1))).toEqual(false);
    expect(err.equals(Err("error"))).toEqual(true);

    const ok1 = Ok(Some(1));
    const ok2 = Ok(Some(1));

    expect(ok1.equals(ok2)).toEqual(true);

    const doubleNested1 = Ok(Some(Ok(1)));
    const doubleNested2 = Ok(Some(Ok(1)));

    expect(doubleNested1.equals(doubleNested2)).toEqual(true);
  });

  it("strictEquals", () => {
    const obj = {};
    const ok: Result<typeof obj, string> = Ok(obj);
    const err: Result<typeof obj, string> = Err("error");

    expect(ok.strictEquals(Ok(obj))).toEqual(true);
    expect(ok.strictEquals(Err("error"))).toEqual(false);
    expect(err.strictEquals(Ok(obj))).toEqual(false);
    expect(err.strictEquals(Err("error"))).toEqual(true);

    const ok1 = Ok(Some(obj));
    const ok2 = Ok(Some(obj));

    expect(ok1.strictEquals(ok2)).toEqual(true);

    const doubleNested1 = Ok(Some(Ok(obj)));
    const doubleNested2 = Ok(Some(Ok(obj)));

    expect(doubleNested1.strictEquals(doubleNested2)).toEqual(true);
  });
});
