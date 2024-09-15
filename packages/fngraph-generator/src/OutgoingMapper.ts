import { Context, DataRecord } from '@fngraph/data'

/**
 * A function that selects output declarations from the output
 * of the getter.
 * @param record The output of the getter
 * @returns A context with output declaration values assigned
 */
type OutgoingMapper<R extends DataRecord = DataRecord> = (record: R) => Generator<Context>

export function* recordAsContext<R extends DataRecord>(record: R): Generator<Context> {
  yield record as unknown as Context
}

export default OutgoingMapper
