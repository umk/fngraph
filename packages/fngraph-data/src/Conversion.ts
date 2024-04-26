import { DataValue } from './DataRecord'

/**
 * A conversion function for a value, which is being assigned
 * to a declaration.
 *
 * The conversion function receives the value to be assigned
 * and the previous value bound to the declaration. The
 * returned value is used in a strict shallow comparison with
 * other values attempted to be assigned to the declaration, so
 * the conversion function may return the previous value in order
 * to consider both previous and new values equal.
 *
 * Use this for conversions like adjusting string case, trimming
 * whitespaces, structural comparison, etc, as well as for
 * asserting the value type in order to throw an error if the
 * type is invalid.
 * @param value A value to be assigned to a declaration
 * @param previous A previous value bound to the declaration, if any
 * @returns A value to be assigned to a declaration
 */
type Conversion = (value: DataValue, previous: DataValue | undefined) => DataValue

export type ConversionPredicate = (a: DataValue, b: DataValue) => boolean

export function createPredicateConversion(predicate: ConversionPredicate): Conversion {
  return function (value, previous) {
    return previous === undefined ? value : predicate(value, previous) ? previous : value
  }
}

export default Conversion
