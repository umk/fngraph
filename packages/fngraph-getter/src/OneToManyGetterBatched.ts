import { DataRecord } from '@fngraph/data'
import {
  CONTEXT_GROUP_INVERSION,
  ContextArrayGroup,
  ContextGroupInversion,
  DEFAULT_MAX_BATCH,
  DEFAULT_MAX_BUFFER,
  Falsy,
  GeneratorValue,
  Getter,
  GetterFactory,
  PropertyRef,
} from '@fngraph/generator'

import { createIteration } from './IterationFunction'
import RecordBatchGroup, { getRecordBatchGroup } from './RecordBatchGroup'

type OneToManyGetterBatched<P extends DataRecord, R extends DataRecord> = (
  record: Array<P>,
  properties: Array<PropertyRef>,
) => Promise<Array<Array<R | Falsy>>>

export function createOneToManyBatched<P extends DataRecord, R extends DataRecord>(
  source: OneToManyGetterBatched<P, R>,
  maxBatch: number = DEFAULT_MAX_BATCH,
  maxBuffer: number = DEFAULT_MAX_BUFFER,
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
      for await (let value of records) {
        context.advanceToValueGroup(value)
        if (context.groups.length > context.groupIndex) {
          const derivations = context.groups[context.groupIndex] as ContextArrayGroup<R> | undefined
          if (derivations) {
            // The cached derived record is defined only if and only
            // if the context is also defined.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const base = getRecord(value.contexts)!
            yield* iteration(value, base, derivations as Array<R>)
          }
          context.groupIndex++
        } else {
          const groups = new Map<number, RecordBatchGroup<R>>()
          // The buffer maintains correct order of yield
          const groupIndexes: Array<number> = []
          let batchSize = 0
          for (let done: boolean | undefined = false; ; ) {
            if (!done) {
              const base = getRecord(value.contexts)
              if (!groups.has(context.groupIndex)) {
                const group = getRecordBatchGroup<R>(context, value, base)
                groups.set(context.groupIndex, group)
                if (group.include) batchSize++
              }
              groupIndexes.push(context.groupIndex)
              context.groupIndex++
            }
            if (groups.size === maxBatch || groupIndexes.length === maxBuffer || done) {
              if (batchSize > 0) {
                const g = Array.from(groups.values()).filter((g) => g.include)
                ;(
                  await source(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    g.map((g) => incoming(g.base!)),
                    properties,
                  )
                )
                  .map((r) => {
                    if (!invert) return r.filter(Boolean)
                    return r.some(Boolean) ? undefined : [CONTEXT_GROUP_INVERSION]
                  })
                  .forEach(
                    (r, i) => (g[i].derived = r as Array<R | ContextGroupInversion> | undefined),
                  )
              }
              for (const groupIndex of groupIndexes) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const group = groups.get(groupIndex)!
                if (context.isCached) context.groups[groupIndex] = group.derived
                if (group.derived) {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  yield* iteration(group.value, group.base!, group.derived as Array<R>)
                }
              }
              break
            }
            ;({ value, done } = await records.next())
            if (!done) context.advanceToValueGroup(value)
          }
        }
      }
    }
  }
}

export default OneToManyGetterBatched
