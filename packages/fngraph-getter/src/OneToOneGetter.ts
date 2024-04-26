import { DataRecord } from '@fngraph/data'
import { ContextGroup, Falsy, GeneratorValue, Getter, GetterFactory } from '@fngraph/generator'

import { createInversion } from './InversionFunction'
import { createIteration } from './IterationFunction'

export type OneToOneGetter<P extends DataRecord, R extends DataRecord> = (
  record: P,
) => Promise<R | Falsy>

export function createOneToOne<P extends DataRecord, R extends DataRecord>(
  source: OneToOneGetter<P, R>,
): GetterFactory<P, R> {
  return function (incoming, outgoing): Getter {
    const iterationF = createIteration(outgoing)
    return async function* (records, context, getRecord, invert): AsyncGenerator<GeneratorValue> {
      const inversion = createInversion(invert)
      const iteration = iterationF(context, invert)
      async function getSourceRecord(current: GeneratorValue) {
        if (context.groups.length > context.groupIndex) {
          const derived = context.groups[context.groupIndex] as ContextGroup<R> | undefined
          if (derived) {
            // The cached derived record is defined only if and only
            // if the context is also defined.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const base = getRecord(current.contexts)!
            return { base, derived }
          }
        } else {
          const base = getRecord(current.contexts)
          if (base) {
            const derived = inversion(await source(incoming(base)))
            if (context.isCached) context.groups.push(derived || undefined)
            if (derived) return { base, derived }
          } else {
            context.groups.push(undefined)
          }
        }
        return undefined
      }
      for await (const current of records) {
        context.advanceToValueGroup(current)
        const record = await getSourceRecord(current)
        if (record) {
          yield* iteration(current, record.base, record.derived as R)
        }
        context.groupIndex++
      }
    }
  }
}

export default OneToOneGetter
