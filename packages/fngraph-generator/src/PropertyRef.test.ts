import PropertyRef, { getUniqueRefs } from './PropertyRef'

describe('getUniqueRefs', () => {
  it('should return an empty array if input array is empty', () => {
    const uniqueRefs = getUniqueRefs([])
    expect(uniqueRefs).toEqual([])
  })

  it('should return unique property refs', () => {
    const refs: Array<PropertyRef> = [['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'e'], ['f']]
    const expectedUniqueRefs: Array<PropertyRef> = [['a', 'b', 'c'], ['a', 'e'], ['f']]
    const uniqueRefs = getUniqueRefs(refs)
    expect(uniqueRefs).toEqual(expectedUniqueRefs)
  })
})
