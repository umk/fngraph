import { DataRecord } from '@fngraph/data'
import {
  ContextGroup,
  DEFAULT_MAX_BATCH,
  DEFAULT_MAX_BUFFER,
  Falsy,
  GeneratorValue,
  Getter,
  GetterFactory,
  PropertyRef,
} from '@fngraph/generator'

import { createInversion } from './InversionFunction'
import { createIteration } from './IterationFunction'
import RecordBatchGroup, { getRecordBatchGroup } from './RecordBatchGroup'

type OneToOneGetterBatched<P extends DataRecord, R extends DataRecord> = (
  records: Array<P>,
  properties: Array<PropertyRef>,
) => Promise<Array<R | Falsy>>

export function createOneToOneBatched<P extends DataRecord, R extends DataRecord>(
  source: OneToOneGetterBatched<P, R>,
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
      const inversion = createInversion(invert)
      const iteration = iterationF(context, invert)
      for await (let value of records) {
        context.advanceToValueGroup(value)
        if (context.groups.length > context.groupIndex) {
          const derived = context.groups[context.groupIndex] as ContextGroup<R> | undefined
          if (derived) {
            // The cached derived record is defined only if and only
            // if the context is also defined.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const base = getRecord(value.contexts)!
            yield* iteration(value, base, derived as R)
          }
          context.groupIndex++
        } else {
          const groups = new Map<number, RecordBatchGroup<R>>()
          // The group indexes buffer maintains correct order of yield
          const groupIndexes: Array<number> = []
          let batchSize = 0 // The number of items to provide to the source
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
                const derived = await source(
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  g.map((g) => incoming(g.base!)),
                  properties,
                )
                derived.map(inversion).forEach((r, i) => (g[i].derived = r || undefined))
              }
              for (const groupIndex of groupIndexes) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const group = groups.get(groupIndex)!
                if (context.isCached) context.groups[groupIndex] = group.derived
                if (group.derived) {
                  // The derived record is defined only when the base
                  // context is defined.
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  yield* iteration(group.value, group.base!, group.derived as R)
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

export default OneToOneGetterBatched
