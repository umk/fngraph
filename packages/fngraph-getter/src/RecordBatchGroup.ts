import { Context, DataRecord } from '@fngraph/data'
import {
  ContextArrayGroup,
  ContextGroup,
  ContextGroupInversion,
  Falsy,
  GeneratorContext,
  GeneratorValue,
} from '@fngraph/generator'

type RecordBatchGroup<R extends DataRecord> = {
  /** Generator value that defines the group */
  value: GeneratorValue
  /** The base context that source records are derived upon */
  base: Context | undefined
  /** The record derived by a getter */
  derived: ContextGroup<R> | ContextArrayGroup<R> | undefined
  /** Indicates whether the group must be included to batch request */
  include: boolean
}

export function getRecordBatchGroup<R extends DataRecord>(
  context: GeneratorContext,
  value: GeneratorValue,
  base: Context | undefined,
): RecordBatchGroup<R> {
  // Get the record from cache that could have been already
  // derived from the source
  const derived = context.groups[context.groupIndex] as
    | R
    | ContextGroupInversion
    | Falsy
    | undefined
  // Include record into request to source if...
  const include =
    !!base && // ...there is a parent record, and...
    // ...the group is not cached yet
    context.groupIndex >= context.groups.length
  return {
    value: {
      n: value.n,
      contexts: Array.from(value.contexts),
    },
    base,
    derived,
    include,
  }
}

export default RecordBatchGroup
