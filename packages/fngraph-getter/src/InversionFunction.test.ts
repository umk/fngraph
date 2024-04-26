import { DataRecord, DeclarationID } from '@fngraph/data'
import { Falsy } from '@fngraph/generator'

import { createInversion } from './InversionFunction'

describe('InversionFunction', () => {
  const declarationId = 'declaration' as DeclarationID

  it('should return a function that inverts the truthiness of the value when invert is true', () => {
    const inversionFunction = createInversion(true)
    const truthyValue: DataRecord = { [declarationId]: 'value' }
    const falsyValue: Falsy = ''

    expect(inversionFunction(truthyValue)).toBeUndefined()
    expect(inversionFunction(falsyValue)).toEqual({})
  })

  it('should return a function that returns the value as it is when invert is false', () => {
    const inversionFunction = createInversion(false)
    const truthyValue: DataRecord = { [declarationId]: 'value' }
    const falsyValue: Falsy = ''

    expect(inversionFunction(truthyValue)).toEqual(truthyValue)
    expect(inversionFunction(falsyValue)).toEqual(falsyValue)
  })
})
