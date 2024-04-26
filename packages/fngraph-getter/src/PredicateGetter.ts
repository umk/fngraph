import { DataRecord } from '@fngraph/data'
import { GetterFactory } from '@fngraph/generator'

import { createOneToOne } from './OneToOneGetter'

type PredicateGetter<P extends DataRecord> = (record: P) => Promise<unknown>

export function createPredicate<P extends DataRecord>(
  source: PredicateGetter<P>,
): GetterFactory<P, Record<string, never>> {
  return createOneToOne(async (record) => ((await source(record as P)) ? {} : undefined))
}

export default PredicateGetter
