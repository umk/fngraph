import { faker } from '@faker-js/faker'
import { Declaration, DeclarationID } from '@fngraph/data'

import Prototype from './Prototype'
import mapPrototype from './mapPrototype'

describe('mapPrototype', () => {
  it('matches top level value', () => {
    const value = { property: faker.lorem.words(3) }
    const prototype: Prototype<typeof value> = {
      property: new Declaration('declaration' as DeclarationID),
    }
    const matches = mapPrototype<typeof value>(prototype)(value)
    expect(Array.from(matches)).toMatchSnapshot()
  })
  it('matches constants', () => {
    const valueA = { a: 'valueA', b: 100 }
    const valueB = { a: 'valueB', b: 200 }
    const prototype: Prototype<{
      a: string
      b: number
    }> = {
      a: new Declaration('declaration' as DeclarationID),
      b: 200,
    }
    const matches = [valueA, valueB].flatMap((s) => {
      const generator = mapPrototype<typeof s>(prototype)(s)
      return Array.from(generator)
    })
    expect(matches).toMatchSnapshot()
  })
  it('performs matching against array', () => {
    const value = {
      property: [faker.lorem.words(3), faker.lorem.words(3), faker.lorem.words(3)],
    }
    const prototype: Prototype<typeof value> = {
      property: new Declaration('declaration' as DeclarationID),
    }
    const matches = mapPrototype<typeof value>(prototype)(value)
    expect(Array.from(matches)).toMatchSnapshot()
  })
  it('performs partial structural comparison', () => {
    const value = {
      propertyA: {
        propertyA1: 'propertyA1',
        propertyA2: 'propertyA2',
        propertyA3: 'propertyA3',
      },
      propertyB: {
        propertyB1: 'propertyB1',
        propertyB2: {
          propertyB21: 'propertyB21',
          propertyB22: ['propertyB221', 'propertyB222', 'propertyB223'],
        },
      },
      propertyC: {
        propertyC1: 'propertyC1',
        propertyC2: 'propertyC2',
      },
    }
    const prototype: Prototype<typeof value> = {
      propertyA: {
        propertyA1: new Declaration('declarationA1' as DeclarationID),
        propertyA3: 'propertyA3',
      },
      propertyB: {
        propertyB1: 'propertyB1',
        propertyB2: {
          propertyB22: new Declaration('declarationB22' as DeclarationID),
        },
      },
      propertyC: {
        propertyC1: 'propertyC1',
      },
    }
    const matches = mapPrototype<typeof value>(prototype)(value)
    expect(Array.from(matches)).toMatchSnapshot()
  })
})
