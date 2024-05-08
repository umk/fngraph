import { DataRecord } from '@fngraph/data'
import {
  CONTEXT_GROUP_INVERSION,
  Falsy,
  GeneratorValue,
  Getter,
  GetterFactory,
} from '@fngraph/generator'

import { createIteration } from './IterationFunction'

type ConstantValues<V extends DataRecord> = Array<V | Falsy> | V | Falsy

export function createConstant<V extends DataRecord>(
  source: ConstantValues<V>,
): GetterFactory<never, V> {
  return function (_incoming, outgoing): Getter {
    const iterationF = createIteration(outgoing)
    return async function* (
      _properties,
      records,
      context,
      getRecord,
      invert,
    ): AsyncGenerator<GeneratorValue> {
      const iteration = iterationF(context, invert)
      for await (const current of records) {
        context.advanceToValueGroup(current)
        const base = getRecord(current.contexts)
        if (base) {
          const valuesArr = Array.isArray(source) ? source : [source]
          if (!invert) {
            yield* iteration(current, base, valuesArr.filter(Boolean) as Array<V>)
          } else {
            if (!valuesArr.some(Boolean)) {
              yield* iteration(current, base, CONTEXT_GROUP_INVERSION as V)
            }
          }
        }
      }
    }
  }
}

export default ConstantValues
