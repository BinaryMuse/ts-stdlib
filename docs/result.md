# Result

A `Result<T, E>` is a value that represents either a successful computation (`Ok<T>`) or an error (`Err<E>`). It's similar to try/catch blocks, but provides a more functional approach to handling errors and composing operations that might fail.

## Overview

To create a `Result` representing a successful computation of type `T`, use the `Ok` function. For example: `const result = Ok(value)`. If you want to create a `Result` representing an error of type `E`, use `Err`. For example: `const error = Err(new Error("Something went wrong"))`.

To get the successful value, call `unwrap()` on the `Result`. If the result is `Err`, then `unwrap()` will throw the error; thus, it's important to check if a result is `Ok` or `Err` before accessing the value, or use a method that provides a default value in case of `Err`, like `unwrapOr(defaultValue)`.

`Result` provides several methods for transforming results and handling errors in a clean, functional way. By using these methods, we can avoid many try/catch blocks and make our error handling more explicit.

For example, here's a typical example using traditional error handling:

```typescript
interface UserAPI {
  fetchUser(id: string): Promise<User>;
  updateProfile(user: User, data: ProfileData): Promise<User>;
  sendNotification(user: User, message: string): Promise<void>;
}

async function updateUserProfile(
  userId: string,
  profileData: ProfileData
) {
  try {
    const user = await api.fetchUser(userId);
    const updatedUser = await api.updateProfile(user, profileData);
    await api.sendNotification(updatedUser, "Profile updated!");
    return updatedUser;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
}
```

Here's the same example using `Result`:

```typescript
interface UserAPI {
  fetchUser(id: string): Promise<Result<User, Error>>;
  updateProfile(user: User, data: ProfileData): Promise<Result<User, Error>>;
  sendNotification(user: User, message: string): Promise<Result<void, Error>>;
}

async function updateUserProfile(
  userId: string,
  profileData: ProfileData
): Promise<Result<User, Error>> {
  return (await api.fetchUser(userId))
    .andThen(user => api.updateProfile(user, profileData))
    .andThen(updatedUser =>
      api.sendNotification(updatedUser, "Profile updated!")
        .map(() => updatedUser)
    );
}
```

You can convert functions that might throw into `Result`-returning functions using a wrapper:

```typescript
function tryResult<T>(fn: () => T): Result<T, Error> {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

// Usage
const result = tryResult(() => divide(10, 2))
  .map(value => value * 2)
  .unwrapOr(0);  // Returns 10

const error = tryResult(() => divide(10, 0))
  .map(value => value * 2)
  .unwrapOr(0);  // Returns 0
```

This pattern is particularly useful when working with existing APIs that might throw errors. The `tryResult` wrapper ensures that any thrown errors are properly captured and converted into a `Result` type.

`Result` is particularly useful when you need to:

* Chain multiple operations that might fail
* Transform errors in a type-safe way
* Provide better error context than exceptions
* Make error handling explicit in your function signatures
