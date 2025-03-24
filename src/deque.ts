/**
 * A `Deque<T>` is a double-ended queue that allows efficient insertion and removal
 * at both ends. It's implemented as a doubly-linked list, making it ideal for
 * situations where you need to add or remove elements from either end in constant time.
 *
 * `Deque` also implements the `Iterable` interface, so you can use it in a `for...of` loop.
 *
 * ## Examples
 *
 * ```ts
 * const deque = new Deque<number>();
 * deque.pushBack(1);
 * deque.pushBack(2);
 * deque.pushFront(0);
 *
 * deque.peekBack();  // Some(2)
 * deque.peekFront(); // Some(0)
 *
 * deque.popBack();   // Some(2)
 * deque.popFront();  // Some(0)
 *
 * deque.popBack();   // Some(1)
 * deque.popFront();  // None
 * ```
 *
 * ```ts
 * const deque = Deque.from([1, 2, 3]);
 * for (const item of deque) {
 *   console.log(item);
 * }
 * // 1
 * // 2
 * // 3
 * ```
 *
 * @module Deque
 * @group deque
 */
import { None, Some, Option } from "./option";

/**
 * @hidden
 */
export type DequeNode<T> = {
  id: symbol;
  value: T;
  prev: Option<DequeNode<T>>;
  next: Option<DequeNode<T>>;
};

/**
 * A double-ended queue.
 * @typeParam T - The type of the elements in the queue.
 * @group deque
 */
export class Deque<T> {
  private front: Option<DequeNode<T>>;
  private back: Option<DequeNode<T>>;

  /**
   * Create a new `Deque<T>` from an iterable.
   *
   * @example
   * ```ts
   * const deque = Deque.from([1, 2, 3]);
   * deque.peekFront(); // Some(1)
   * deque.peekBack(); // Some(3)
   * ```
   *
   * @param iterable - The iterable to create the deque from.
   * @returns A new `Deque<T>`.
   *
   * @group deque
   */
  static from<T>(iterable: Iterable<T>): Deque<T> {
    const deque = new Deque<T>();
    for (const item of iterable) {
      deque.pushBack(item);
    }
    return deque;
  }

  constructor() {
    const none = None;
    this.front = none;
    this.back = none;
  }

  /**
   * Add an item to the front of the deque.
   * @param item - The item to add to the front of the deque.
   *
   * @group deque
   */
  public pushFront(item: T) {
    if (this.front.isNone()) {
      const node = Some({ id: Symbol(), value: item, prev: None, next: None });
      this.front = node;
      this.back = node;
    } else {
      const node = Some({
        id: Symbol(),
        value: item,
        prev: this.front,
        next: None,
      });
      this.front.unwrap().next = node;
      this.front = node;
    }
  }

  /**
   * Add an item to the back of the deque.
   * @param item - The item to add to the back of the deque.
   *
   * @group deque
   */
  public pushBack(item: T) {
    if (this.back.isNone()) {
      const node = Some({ id: Symbol(), value: item, prev: None, next: None });
      this.front = node;
      this.back = node;
    } else {
      const node = Some({
        id: Symbol(),
        value: item,
        prev: None,
        next: this.back,
      });
      this.back.unwrap().prev = node;
      this.back = node;
    }
  }

  /**
   * Remove and return the item from the front of the deque.
   * @returns The item from the front of the deque, or `None` if the deque is empty.
   *
   * @group deque
   */
  public popFront(): Option<T> {
    const value = this.peekFront();
    const frontId = this.front.map((node) => node.id);
    const backId = this.back.map((node) => node.id);
    if (frontId.equals(backId)) {
      this.front = None;
      this.back = None;
    } else {
      const prev = this.front.unwrap().prev;
      prev.unwrap().next = None;
      this.front = prev;
    }

    return value;
  }

  /**
   * Remove and return the item from the back of the deque.
   * @returns The item from the back of the deque, or `None` if the deque is empty.
   *
   * @group deque
   */
  public popBack(): Option<T> {
    const value = this.peekBack();
    const frontId = this.front.map((node) => node.id);
    const backId = this.back.map((node) => node.id);
    if (frontId.equals(backId)) {
      this.front = None;
      this.back = None;
    } else {
      const next = this.back.unwrap().next;
      next.unwrap().prev = None;
      this.back = next;
    }

    return value;
  }

  /**
   * Peek the item from the front of the deque.
   * @returns The item from the front of the deque, or `None` if the deque is empty.
   *
   * @group deque
   */
  public peekFront(): Option<T> {
    return this.front.map((node) => node.value);
  }

  /**
   * Peek the item from the back of the deque.
   * @returns The item from the back of the deque, or `None` if the deque is empty.
   *
   * @group deque
   */
  public peekBack(): Option<T> {
    return this.back.map((node) => node.value);
  }

  /**
   * @hidden
   */
  public [Symbol.iterator]() {
    let current = this.front;
    return {
      next: () => {
        if (current.isNone()) {
          return { done: true, value: undefined };
        }
        const value = current.unwrap().value;
        current = current.unwrap().prev;
        return { done: false, value };
      },
    };
  }
}
