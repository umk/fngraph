import { PropertyRef } from '@fngraph/generator'

import { createGetterPrototype } from './GetterPrototype'

describe('createGetterPrototype', () => {
  const getter = jest.fn()

  beforeEach(() => {
    getter.mockImplementation((record: Record<string, unknown>, properties: Array<PropertyRef>) => {
      return { record, properties }
    })
  })

  it('should create a getter with static overrides', () => {
    const overrides = { overrideKey: 'overrideValue' }
    const record = { recordKey: 'recordValue' }
    const properties: Array<PropertyRef> = [['propertyKey']]

    const getterWithOverrides = createGetterPrototype(getter)(overrides)
    const result = getterWithOverrides(record, properties)

    expect(result).toEqual({
      record: {
        recordKey: 'recordValue',
        overrideKey: 'overrideValue',
      },
      properties,
    })
    expect(getter).toHaveBeenCalledWith(
      {
        recordKey: 'recordValue',
        overrideKey: 'overrideValue',
      },
      properties,
    )
  })

  it('should create a getter with dynamic overrides', () => {
    const overrides = (options: { optionKey: string }) => ({
      overrideKey: `overrideValue-${options.optionKey}`,
    })
    const record = { recordKey: 'recordValue', optionKey: 'optionValue' }
    const properties: Array<PropertyRef> = [['propertyKey']]

    const getterWithOverrides = createGetterPrototype(getter)(overrides)
    const result = getterWithOverrides(record, properties)

    expect(result).toEqual({
      record: {
        recordKey: 'recordValue',
        optionKey: 'optionValue',
        overrideKey: 'overrideValue-optionValue',
      },
      properties,
    })
    expect(getter).toHaveBeenCalledWith(
      {
        recordKey: 'recordValue',
        optionKey: 'optionValue',
        overrideKey: 'overrideValue-optionValue',
      },
      properties,
    )
  })

  it('should create a getter without overrides', () => {
    const record = { recordKey: 'recordValue' }
    const properties: Array<PropertyRef> = [['propertyKey']]

    const getterWithoutOverrides = createGetterPrototype(getter)()
    const result = getterWithoutOverrides(record, properties)

    expect(result).toEqual({
      record: {
        recordKey: 'recordValue',
      },
      properties,
    })
    expect(getter).toHaveBeenCalledWith(
      {
        recordKey: 'recordValue',
      },
      properties,
    )
  })
})
