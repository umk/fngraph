import { Context, DeclarationID } from '@fngraph/data'
import {
  contextAsRecord,
  createGetContextRecord,
  createMergeContexts,
  GeneratorContext,
  GeneratorValue,
  recordAsContext,
} from '@fngraph/generator'

import { createConstant } from './ConstantValues'

describe('createConstant', () => {
  const declarationA = 'declaration A' as DeclarationID
  const declarationB = 'declaration B' as DeclarationID
  it('iterates through constant records', async () => {
    const records: AsyncGenerator<GeneratorValue> = (async function* () {
      yield { contexts: [{} as Context], n: 1 }
    })()
    const context = new GeneratorContext(0, [], false)
    const getRecord = createGetContextRecord([], createMergeContexts([]))
    const getter = createConstant([
      { [declarationA]: 1, [declarationB]: 2 },
      { [declarationA]: 3, [declarationB]: 4 },
    ])(contextAsRecord, recordAsContext)
    const derived: Array<GeneratorValue> = []
    for await (const record of getter(records, context, getRecord, false)) {
      derived.push({
        contexts: [...record.contexts],
        n: record.n,
      })
    }
    expect(derived).toMatchSnapshot()
  })
})
