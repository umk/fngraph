import { PropertyRef } from '@fngraph/generator'

import { createGetterBatchedPrototype } from './GetterBatchedPrototype'

describe('createGetterBatchedPrototype', () => {
  const getter = jest.fn()

  beforeEach(() => {
    getter.mockImplementation(
      (records: Array<Record<string, unknown>>, properties: Array<PropertyRef>) => {
        return { records, properties }
      },
    )
  })

  it('should create a getter with static overrides', () => {
    const overrides = { overrideKey: 'overrideValue' }
    const records = [{ recordKey: 'recordValueA' }, { recordKey: 'recordValueB' }]
    const properties: Array<PropertyRef> = [['propertyKey']]

    const getterWithOverrides = createGetterBatchedPrototype(getter)(overrides)
    const result = getterWithOverrides(records, properties)

    expect(result).toEqual({
      records: [
        {
          recordKey: 'recordValueA',
          overrideKey: 'overrideValue',
        },
        {
          recordKey: 'recordValueB',
          overrideKey: 'overrideValue',
        },
      ],
      properties,
    })
    expect(getter).toHaveBeenCalledWith(
      [
        {
          recordKey: 'recordValueA',
          overrideKey: 'overrideValue',
        },
        {
          recordKey: 'recordValueB',
          overrideKey: 'overrideValue',
        },
      ],
      properties,
    )
  })

  it('should create a getter with dynamic overrides', () => {
    const overrides = (options: { optionKey: string }) => ({
      overrideKey: `overrideValue-${options.optionKey}`,
    })
    const records = [
      { recordKey: 'recordValueA', optionKey: 'optionValueA' },
      { recordKey: 'recordValueB', optionKey: 'optionValueB' },
    ]
    const properties: Array<PropertyRef> = [['propertyKey']]

    const getterWithOverrides = createGetterBatchedPrototype(getter)(overrides)
    const result = getterWithOverrides(records, properties)

    expect(result).toEqual({
      records: [
        {
          recordKey: 'recordValueA',
          optionKey: 'optionValueA',
          overrideKey: 'overrideValue-optionValueA',
        },
        {
          recordKey: 'recordValueB',
          optionKey: 'optionValueB',
          overrideKey: 'overrideValue-optionValueB',
        },
      ],
      properties,
    })
    expect(getter).toHaveBeenCalledWith(
      [
        {
          recordKey: 'recordValueA',
          optionKey: 'optionValueA',
          overrideKey: 'overrideValue-optionValueA',
        },
        {
          recordKey: 'recordValueB',
          optionKey: 'optionValueB',
          overrideKey: 'overrideValue-optionValueB',
        },
      ],
      properties,
    )
  })

  it('should create a getter without overrides', () => {
    const records = [{ recordKey: 'recordValueA' }, { recordKey: 'recordValueB' }]
    const properties: Array<PropertyRef> = [['propertyKey']]

    const getterWithoutOverrides = createGetterBatchedPrototype(getter)()
    const result = getterWithoutOverrides(records, properties)

    expect(result).toEqual({
      records: [{ recordKey: 'recordValueA' }, { recordKey: 'recordValueB' }],
      properties,
    })
    expect(getter).toHaveBeenCalledWith(
      [{ recordKey: 'recordValueA' }, { recordKey: 'recordValueB' }],
      properties,
    )
  })
})
