import { DataRecord, DataValue, Declaration, Primitive } from '@fngraph/data'

type Prototype<V = unknown> = DataValue extends V
  ? unknown
  :
      | Declaration
      | (V extends DataValue ? Matcher<V> : never)
      | (V extends Primitive ? V : never)
      | (V extends Array<infer I> ? Prototype<I> : never)
      | (V extends Record<string, unknown> ? { [K in keyof V]?: Prototype<V[K]> } : never)

/**
 * A matcher is a function, which takes a value and returns a collection of
 * records, where each record contains bindings to declarations for each
 * match in the value.
 * @param record A parent record that contains existing bindings
 * @param value The value to check against the matcher
 * @returns
 * A collection of records, where each record contains bindings to
 * declarations for each match in the value.
 */
export type Matcher<V extends DataValue> = (record: DataRecord, value: V) => Generator<DataRecord>

/**
 * A predicate is a function, which takes a value and returns
 * a boolean value, which indicates whether the value matches
 * the predicate.
 * @param value The value to check
 * @returns A boolean value, which indicates whether the value matches the predicate
 */
export type MatcherPredicate = (value: DataValue) => boolean

/**
 * Creates a matcher, which iterates values based on matches
 * against the predicate.
 * @param predicate The predicate, which is used to match values
 * @returns A matcher, which iterates values based on matches
 */
export function createPredicateMatcher<V extends DataValue>(
  predicate: MatcherPredicate,
): Matcher<V> {
  const matcher: Matcher<V> = function* (record, value) {
    if (Array.isArray(value)) {
      for (const item of value) {
        yield* matcher(record, item)
      }
    } else if (predicate(value)) {
      yield record
    }
  }
  return matcher
}

/**
 * A matcher, which considers any value to be a match.
 */
export const anyValue: Matcher<DataValue> = function* (record: DataRecord): Generator<DataRecord> {
  yield record
}

export default Prototype
