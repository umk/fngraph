import { DataRecord } from '@fngraph/data'
import { ContextGroupInversion, Falsy } from '@fngraph/generator'

type InversionFunction = <R extends DataRecord>(
  value: R | Falsy,
) => R | ContextGroupInversion | Falsy

/**
 * This function creates an inversion function based on the invert parameter.
 * If invert is true, the returned function will return undefined for truthy values and an empty object for falsy values.
 * If invert is false, the returned function will return the value as it is.
 *
 * @param invert A boolean value to determine the behavior of the returned function.
 * @returns A function that takes a value of type DataRecord or Falsy and returns a value of the same type.
 */
export function createInversion(invert: boolean): InversionFunction {
  if (!invert) {
    // If invert is false, return a function that returns the value as it is.
    return function <R extends DataRecord>(value: R | Falsy): R | Falsy {
      return value
    }
  } else {
    // If invert is true, return a function that inverts the truthiness of the value.
    return function <R extends DataRecord>(value: R | Falsy): R | Record<string, never> | Falsy {
      return value ? undefined : {}
    }
  }
}

export default InversionFunction
