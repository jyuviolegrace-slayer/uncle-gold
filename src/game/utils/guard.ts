/**
 * Guard utility functions
 * Ported from archive/src/utils/guard.js
 */

/**
 * Utility function to ensure we handle the full possible range of types when checking a variable for a possible
 * type in a union.
 *
 * A good example of this is when we check for all of the possible values in a `switch` statement, and we want
 * to ensure we check for all possible values in an enum type object.
 * @param _value The value that should never reach this function
 */
export function exhaustiveGuard(_value: never): never {
  throw new Error(`Error! Reached forbidden guard function with unexpected value: ${JSON.stringify(_value)}`);
}