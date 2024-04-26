import { Context, DeclarationID } from '@fngraph/data'

import { createGetContextRecord } from './GetContextRecord'

describe('createGetContextRecord', () => {
  const declarationA = 'declaration A' as DeclarationID
  const declarationB = 'declaration A' as DeclarationID
  const declarationC = 'declaration A' as DeclarationID
  const declarationD = 'declaration A' as DeclarationID

  it('should property merge records based on parent references', () => {
    const recordA = { [declarationA]: 'A' } as Context
    const recordB = { [declarationB]: 'B' } as Context
    const recordC = { [declarationC]: 'C' } as Context
    const recordD = { [declarationD]: 'D' } as Context
    const records = [recordA, recordB, recordC, recordD]

    const parentRefs = [1, 3]

    const getContextRecord = createGetContextRecord(parentRefs, (records) => {
      return records.reduce((acc, record) => {
        return { ...acc, ...record } as Context
      }, {} as Context)
    })

    const record = getContextRecord(records)
    expect(record).toEqual({ [declarationB]: 'B', [declarationD]: 'D' })
  })
})
