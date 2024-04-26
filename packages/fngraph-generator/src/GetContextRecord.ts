import { Context } from '@fngraph/data'

import { GeneratorValueContexts } from './GeneratorValue'
import MergeContexts from './MergeContexts'

type GetContextRecord = (records: GeneratorValueContexts) => Context | undefined

export function createGetContextRecord(
  parentRefs: Array<number>,
  mergeContexts: MergeContexts,
): GetContextRecord {
  return function (records: GeneratorValueContexts) {
    const parentRecords = parentRefs.map((r) => records[r])
    return mergeContexts(parentRecords)
  }
}

export default GetContextRecord
