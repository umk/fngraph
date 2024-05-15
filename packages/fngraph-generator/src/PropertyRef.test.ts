import PropertyRef, { getUniquePropertyRefs } from './PropertyRef'

describe('getUniquePropertyRefs', () => {
  it('should return an empty array if input array is empty', () => {
    const uniqueRefs = getUniquePropertyRefs([])
    expect(uniqueRefs).toEqual([])
  })

  it('should return unique property refs', () => {
    const refs: Array<PropertyRef> = [['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'e'], ['f']]
    const expectedUniqueRefs: Array<PropertyRef> = [['a', 'b', 'c'], ['a', 'e'], ['f']]
    const uniqueRefs = getUniquePropertyRefs(refs)
    expect(uniqueRefs).toEqual(expectedUniqueRefs)
  })
})
