import { faker } from '@faker-js/faker'
import { Declaration } from '@fngraph/data'

import { createGetProperties } from './Prototype'

describe('createGetProperties', () => {
  const declarationB = new Declaration('declaration B')
  const declarationD = new Declaration('declaration D')
  const declarationE = new Declaration('declaration E')

  const getProperties = createGetProperties({
    a: faker.number.int(),
    b: declarationB,
    c: {
      d: declarationD,
    },
    e: declarationE,
  })

  it('returns referenced properties', () => {
    const result = getProperties([declarationB.id, declarationD.id], false)
    expect(result).toEqual([['a'], ['b'], ['c', 'd']])
  })

  it('returns only base properties in case of inversion', () => {
    const result = getProperties([declarationB.id, declarationD.id], true)
    expect(result).toEqual([['a']])
  })
})
