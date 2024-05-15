import { faker } from '@faker-js/faker'

import Context from './Context'
import Declaration from './Declaration'

describe('Declaration', () => {
  it('gets a value indicating that result does not have a value bound to declaration', () => {
    const declaration = new Declaration('declaration')
    const context = {} as Context
    expect(declaration.getOrDefault(context)).toBeUndefined()
  })
  it('throws an error if no value is bound to declaration', () => {
    const declaration = new Declaration('declaration')
    const context = {} as Context
    expect(() => declaration.get(context)).toThrowErrorMatchingSnapshot()
  })
  it('sets a value to declaration', () => {
    const declaration = new Declaration('declaration')
    const value = faker.number.int()
    const context = {} as Context
    declaration.set(context, value)
    expect(context).toMatchSnapshot()
    expect(declaration.get(context)).toBe(value)
  })
  it('throws an error if value is already set', () => {
    const context = {} as Context
    const declaration = new Declaration('declaration')
    const valueA = faker.number.int()
    const valueB = faker.number.int()
    declaration.set(context, valueA)
    expect(() => declaration.set(context, valueB)).toThrowErrorMatchingSnapshot()
  })
  it('can implement structural comparison', () => {
    const context = {} as Context
    const declaration = new Declaration('declaration', {
      conversion: function (value, previous) {
        const { a: valueA, b: valueB } = value as { a: number; b: number }
        if (previous) {
          const { a: previousA, b: previousB } = previous as { a: number; b: number }
          if (previous && valueA === previousA && valueB === previousB) {
            return previous
          }
        }
        return value
      },
    })
    const valueA = { a: faker.number.int(), b: faker.number.int() }
    const valueB = { ...valueA }
    const valueC = { a: faker.number.int(), b: faker.number.int() }
    declaration.set(context, valueA)
    expect(declaration.ensure(context, valueB)).toBe(true)
    expect(declaration.ensure(context, valueC)).toBe(false)
  })
  it('implements case sensitive comparison by default', () => {
    const context = {} as Context
    const declaration = new Declaration('declaration')
    const valueA = faker.lorem.word()
    const valueB = valueA.toUpperCase()
    declaration.set(context, valueA)
    expect(declaration.ensure(context, valueB)).toBe(false)
  })
  it('can implement case insensitive comparison', () => {
    const context = {} as Context
    const declaration = new Declaration('declaration', {
      conversion: function (value) {
        return (value as string).toLowerCase()
      },
    })
    const valueA = faker.lorem.word()
    const valueB = valueA.toUpperCase()
    declaration.set(context, valueA)
    expect(declaration.ensure(context, valueB)).toBe(true)
  })
})
