import { DataRecord } from '@fngraph/data'
import { DEFAULT_MAX_BATCH, DEFAULT_MAX_BUFFER, GetterFactory } from '@fngraph/generator'

import { createOneToOneBatched } from './OneToOneGetterBatched'

type PredicateGetterBatched<P extends DataRecord> = (records: Array<P>) => Promise<Array<unknown>>

export function createPredicateBatched<P extends DataRecord>(
  source: PredicateGetterBatched<P>,
  maxBatch: number = DEFAULT_MAX_BATCH,
  maxBuffer: number = DEFAULT_MAX_BUFFER,
): GetterFactory<P, Record<string, never>> {
  return createOneToOneBatched(
    async (records) => (await source(records as Array<P>)).map((r) => (r ? {} : undefined)),
    maxBatch,
    maxBuffer,
  )
}

export default PredicateGetterBatched
