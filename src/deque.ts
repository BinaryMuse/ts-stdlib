import { None, Some, Option } from "./option";

export type DequeNode<T> = {
  id: symbol;
  value: T;
  prev: Option<DequeNode<T>>;
  next: Option<DequeNode<T>>;
};

export class Deque<T> {
  private front: Option<DequeNode<T>>;
  private back: Option<DequeNode<T>>;

  constructor() {
    const none = None;
    this.front = none;
    this.back = none;
  }

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

  public popFront(): Option<T> {
    const value = this.peekFront();
    if (
      this.front.map((node) => node.id).unwrapOr(Symbol()) ===
      this.back.map((node) => node.id).unwrapOr(Symbol())
    ) {
      const none = None;
      this.front = none;
      this.back = none;
    } else {
      const prev = this.front.unwrap().prev;
      prev.unwrap().next = None;
      this.front = prev;
    }

    return value;
  }

  public popBack(): Option<T> {
    const value = this.peekBack();
    if (
      this.front.map((node) => node.id).unwrapOr(Symbol()) ===
      this.back.map((node) => node.id).unwrapOr(Symbol())
    ) {
      this.front = None;
      this.back = None;
    } else {
      const next = this.back.unwrap().next;
      next.unwrap().prev = None;
      this.back = next;
    }

    return value;
  }

  public peekFront(): Option<T> {
    return this.front.map((node) => node.value);
  }

  public peekBack(): Option<T> {
    return this.back.map((node) => node.value);
  }

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
