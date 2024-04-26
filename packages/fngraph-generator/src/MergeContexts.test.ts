import { Context, Declaration, DeclarationID } from '@fngraph/data'

import { createMergeContexts } from './MergeContexts'

describe('createMergeContexts', () => {
  const declarationA = 'declarationA' as DeclarationID
  const declarationB = 'declarationB' as DeclarationID

  it('should return the single context when only one context is provided', () => {
    const declarations: Declaration[] = []
    const mergeContexts = createMergeContexts(declarations)
    const context = { [declarationA]: 'value A' } as Context
    expect(mergeContexts([context])).toEqual(context)
  })

  it('should return undefined when any context is undefined', () => {
    const declarations: Declaration[] = []
    const mergeContexts = createMergeContexts(declarations)
    const context = { [declarationA]: 'value A' } as Context
    expect(mergeContexts([context, undefined])).toBeUndefined()
  })

  it('should merge multiple contexts correctly', () => {
    const declarations: Declaration[] = []
    const mergeContexts = createMergeContexts(declarations)
    const contextA = { [declarationA]: 'value A' } as Context
    const contextB = { [declarationB]: 'value B' } as Context
    expect(mergeContexts([contextA, contextB])).toEqual({
      [declarationA]: 'value A',
      [declarationB]: 'value B',
    })
  })

  it('should return undefined when merging contexts with conflicting values', () => {
    const declarations: Declaration[] = []
    const mergeContexts = createMergeContexts(declarations)
    const contextA = { [declarationA]: 'value A' } as Context
    const contextB = { [declarationA]: 'value B' } as Context
    expect(mergeContexts([contextA, contextB])).toBeUndefined()
  })

  it('should merge multiple contexts if conflicting declarations have the same value', () => {
    const declarations: Declaration[] = []
    const mergeContexts = createMergeContexts(declarations)
    const contextA = { [declarationA]: 'value A' } as Context
    const contextB = { [declarationA]: 'value A' } as Context
    expect(mergeContexts([contextA, contextB])).toEqual({
      [declarationA]: 'value A',
    })
  })

  it('should merge multiple contexts if conflicting declarations converted to same value', () => {
    const declarations: Declaration[] = [
      new Declaration(declarationA, {
        conversion: (value) => typeof value === 'string' && value.toLowerCase(),
      }),
    ]
    const mergeContexts = createMergeContexts(declarations)
    const contextA = { [declarationA]: 'value A' } as Context
    const contextB = { [declarationA]: 'VALUE A' } as Context
    expect(mergeContexts([contextA, contextB])).toEqual({
      [declarationA]: 'value a',
    })
  })
})
