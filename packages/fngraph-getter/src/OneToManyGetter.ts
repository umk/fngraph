import { DataRecord } from '@fngraph/data'
import {
  CONTEXT_GROUP_INVERSION,
  ContextArrayGroup,
  Falsy,
  GeneratorValue,
  Getter,
  GetterFactory,
  PropertyRef,
} from '@fngraph/generator'

import { createIteration } from './IterationFunction'

type OneToManyGetter<P extends DataRecord, R extends DataRecord> = (
  record: P,
  properties: Array<PropertyRef>,
) => AsyncGenerator<R | Falsy>

export function createOneToMany<P extends DataRecord, R extends DataRecord>(
  source: OneToManyGetter<P, R>,
): GetterFactory<P, R> {
  return function (incoming, outgoing): Getter {
    const iterationF = createIteration(outgoing)
    return async function* (
      properties,
      records,
      context,
      getRecord,
      invert,
    ): AsyncGenerator<GeneratorValue> {
      const iteration = iterationF(context, invert)
      async function* getSourceRecords(current: GeneratorValue) {
        if (context.groups.length > context.groupIndex) {
          const group = context.groups[context.groupIndex] as ContextArrayGroup<R> | undefined
          if (group) {
            // The cached derived record is defined only if and only
            // if the context is also defined.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const base = getRecord(current.contexts)!
            yield { base, group }
          }
        } else {
          const base = getRecord(current.contexts)
          if (base) {
            const derivations = source(incoming(base), properties)
            let group: ContextArrayGroup<R> = []
            if (context.isCached) {
              group = []
              context.groups.push(group)
            }
            if (!invert) {
              for await (const derived of derivations) {
                if (derived) group.push(derived)
              }
            } else {
              for await (const derived of derivations) {
                if (derived) return
              }
              group.push(CONTEXT_GROUP_INVERSION)
            }
            yield { base, group }
          } else {
            context.groups.push(undefined)
          }
        }
        return undefined
      }
      for await (const current of records) {
        context.advanceToValueGroup(current)
        const records = getSourceRecords(current)
        for await (const record of records) {
          yield* iteration(current, record.base, record.group as Array<R>)
        }
        context.groupIndex++
      }
    }
  }
}

export default OneToManyGetter
