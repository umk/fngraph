import { Context } from '@fngraph/data'
import { GeneratorContext, GeneratorValue } from '@fngraph/generator'

import { getRecordBatchGroup } from './RecordBatchGroup'

describe('getRecordBatchGroup', () => {
  it('should return a record batch group with include set to false when there is no parent record', () => {
    const context = new GeneratorContext(0, [], false)
    const generatorValue: GeneratorValue = { n: 1, contexts: [] }

    const result = getRecordBatchGroup(context, generatorValue, undefined)

    expect(result.include).toBe(false)
  })

  it('should return a record batch group with include set to false when there is a derived value', () => {
    const context = new GeneratorContext(0, [], false)
    context.groups[context.groupIndex] = {}
    const generatorValue: GeneratorValue = { n: 1, contexts: [] }

    const result = getRecordBatchGroup(context, generatorValue, {} as Context)

    expect(result.include).toBe(false)
  })

  it('should return a record batch group with include set to true when there is a parent record, no derived value, and the group is not cached yet', () => {
    const context = new GeneratorContext(0, [], false)
    const generatorValue: GeneratorValue = { n: 1, contexts: [] }

    const result = getRecordBatchGroup(context, generatorValue, {} as Context)

    expect(result.include).toBe(true)
  })
})
