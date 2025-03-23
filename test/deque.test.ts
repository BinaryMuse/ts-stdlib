import { test, expect, describe } from "vitest";
import { Deque } from "../src";

describe("Deque", () => {
  test("pushFront", () => {
    const deque = new Deque<number>();
    deque.pushFront(1);
    expect(deque.peekFront().unwrap()).toEqual(1);
    deque.pushFront(2);
    expect(deque.peekFront().unwrap()).toEqual(2);
  });

  test("popFront", () => {
    const deque = new Deque<number>();
    deque.pushFront(1);
    deque.pushFront(2);
    let items = [...deque];
    expect(items).toEqual([2, 1]);
    expect(deque.popFront().unwrap()).toEqual(2);
    expect(deque.peekFront().unwrap()).toEqual(1);
    expect(deque.popFront().unwrap()).toEqual(1);
    expect(deque.peekFront().isNone()).toBe(true);
  });

  test("pushBack", () => {
    const deque = new Deque<number>();
    deque.pushBack(1);
    expect(deque.peekBack().unwrap()).toEqual(1);
    deque.pushBack(2);
    expect(deque.peekBack().unwrap()).toEqual(2);
  });

  test("popBack", () => {
    const deque = new Deque<number>();
    deque.pushBack(1);
    deque.pushBack(2);
    expect(deque.popBack().unwrap()).toEqual(2);
    expect(deque.peekBack().unwrap()).toEqual(1);
    expect(deque.popBack().unwrap()).toEqual(1);
    expect(deque.peekBack().isNone()).toBe(true);
  });

  test("deque", () => {
    const deque = new Deque<number>();
    let items = [...deque];
    expect(items).toEqual([]);

    deque.pushFront(1);
    deque.pushBack(2);
    deque.pushFront(3);
    deque.pushBack(4);

    items = [...deque];
    expect(items).toEqual([3, 1, 2, 4]);

    expect(deque.popFront().unwrap()).toEqual(3);
    expect(deque.popFront().unwrap()).toEqual(1);
    expect(deque.popBack().unwrap()).toEqual(4);
    expect(deque.popBack().unwrap()).toEqual(2);
    expect(deque.peekFront().isNone()).toBe(true);
    expect(deque.peekBack().isNone()).toBe(true);
  });

  test("[Symbol.iterator]", () => {
    const deque = new Deque<number>();

    deque.pushFront(1);
    deque.pushBack(2);
    deque.pushFront(3);
    deque.pushBack(4);

    const iter = deque[Symbol.iterator]();
    expect(iter.next().value).toEqual(3);
    expect(iter.next().value).toEqual(1);
    expect(iter.next().value).toEqual(2);
    expect(iter.next().value).toEqual(4);
    expect(iter.next().done).toBe(true);
  });
});
