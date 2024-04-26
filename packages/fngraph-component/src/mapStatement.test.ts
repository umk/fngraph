import { faker } from '@faker-js/faker'
import { Context, DataValue, Declaration, DeclarationID } from '@fngraph/data'

import mapStatement from './mapStatement'

describe('mapStatement', () => {
  const declarationA = new Declaration('declaration A' as DeclarationID)
  const declarationB = new Declaration('declaration B' as DeclarationID)
  const declarationC = new Declaration('declaration C' as DeclarationID)

  it('should return the value of a declaration statement', () => {
    const value = faker.number.int()
    const context = { [declarationA.id]: value } as Record<DeclarationID, DataValue> as Context
    const statement = { propertyA: declarationA }
    const result = mapStatement(statement)(context)
    expect(result).toEqual({ propertyA: value })
  })

  it('should handle an object statement and return the correct values', () => {
    const valueA = faker.number.int()
    const valueB = faker.number.int()
    const context = {
      [declarationA.id]: valueA,
      [declarationB.id]: valueB,
    } as Record<DeclarationID, DataValue> as Context
    const statement = {
      property: {
        propertyA: declarationA,
        propertyB: declarationB,
      },
    }
    const result = mapStatement(statement)(context)
    expect(result).toEqual({
      property: {
        propertyA: valueA,
        propertyB: valueB,
      },
    })
  })

  it('should handle nested object statements and return the correct values', () => {
    const valueA = faker.number.int()
    const valueB = faker.number.int()
    const valueC = faker.number.int()
    const context = {
      [declarationA.id]: valueA,
      [declarationB.id]: valueB,
      [declarationC.id]: valueC,
    } as Record<DeclarationID, DataValue> as Context
    const statement = {
      property: {
        propertyA: declarationA,
        propertyB: declarationB,
        property: {
          propertyC: declarationC,
        },
      },
    }
    const result = mapStatement(statement)(context)
    expect(result).toEqual({
      property: {
        propertyA: valueA,
        propertyB: valueB,
        property: {
          propertyC: valueC,
        },
      },
    })
  })
})
