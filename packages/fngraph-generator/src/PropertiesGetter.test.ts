import PropertiesGetter, { combinePropertiesGetters } from './PropertiesGetter'
import PropertyRef from './PropertyRef'

describe('combinePropertiesGetters', () => {
  it('should return an empty array if input array is empty', () => {
    const getters: Array<PropertiesGetter> = []
    const uniqueRefs = combinePropertiesGetters(getters)([])
    expect(uniqueRefs).toEqual([])
  })

  it('should return unique property refs produced by getters', () => {
    const getters: Array<PropertiesGetter> = [
      [
        ['a', 'b', 'c'],
        ['a', 'e'],
      ],
      [['a', 'b', 'c'], ['f']],
    ].map((v) => () => v as Array<PropertyRef>)
    const expectedUniqueRefs: Array<PropertyRef> = [['a', 'b', 'c'], ['a', 'e'], ['f']]
    const uniqueRefs = combinePropertiesGetters(getters)([])
    expect(uniqueRefs).toEqual(expectedUniqueRefs)
  })
})
