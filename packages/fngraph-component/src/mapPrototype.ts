import { Context, DataRecord, DataValue, Declaration } from '@fngraph/data'
import { OutgoingMapper } from '@fngraph/generator'

import Prototype from './Prototype'

/**
 * A function that matches provided statement value against
 * the prototype.
 * @param prototype A prototype that partially corresponds to the structure of matching value
 * @param value A value to match against the prototype
 * @param context The context object, which maps declarations to resolved values
 * @returns
 * A collection of contexts, where each context contains bindings
 * to declarations for each match in the value.
 */
function* getPrototypeMatches(
  prototype: Prototype,
  value: DataValue,
  context: Context = {} as Context,
): Generator<Context> {
  if (Array.isArray(value)) {
    // Prototypes may be defined against array value items,
    // but not against arrays themselves. The matcher just runs
    // a prototype comparison against each item of the array
    // value and returns records for matches.
    for (const item of value) {
      yield* getPrototypeMatches(prototype, item, { ...context })
    }
  } else {
    if (prototype instanceof Declaration) {
      // The prototype is a declaration, provided in an initial
      // query, so the value is either checked against the
      // declaration value, if it's present in the record, or
      // the value is set to the record.
      if (prototype.ensure(context, value)) {
        yield context
      }
    } else if (typeof prototype === 'function') {
      // The prototype is a custom matcher, which checks the
      // corresponding value in the structure of prototype by itself.
      yield* prototype(context, value)
    } else if (typeof prototype === 'object' && prototype !== null) {
      // The object prototype declares the shape of the value
      // and prototype for each of the properties. Even if the
      // prototype doesn't declare a single property, the value
      // is checked to be an object.
      if (typeof value === 'object' && value !== null) {
        yield* Object.entries(prototype).reduce(function* (prev, [key, prototype]) {
          if (key in value) {
            for (const context of prev) {
              yield* getPrototypeMatches(prototype, value[key], context)
            }
          }
        }, getThisContext(context))
      }
    } else if (prototype === value) {
      yield* getThisContext(context)
    }
  }
}

/**
 * Creates a generator that interates through a collection of
 * exactly one context.
 * @param context A context to iterate.
 */
function* getThisContext(context: Context): Generator<Context> {
  yield context
}

function mapPrototype<R extends DataRecord>(prototype: Prototype<R>): OutgoingMapper<R> {
  return function (record: R): Generator<Context> {
    return getPrototypeMatches(prototype, record)
  }
}

export default mapPrototype
