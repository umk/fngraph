import { DeclarationID } from '@fngraph/data'

import Instance from './Instance'
import deriveGeneratorInstances from './deriveGeneratorInstances'

describe('deriveGeneratorInstances', () => {
  const instanceA = {
    incoming: [] as Array<DeclarationID>,
    outgoing: ['declaration A' as DeclarationID],
    invert: false,
    isPure: true,
  } as Instance
  const instanceB = {
    incoming: [] as Array<DeclarationID>,
    outgoing: ['declaration B' as DeclarationID],
    invert: false,
    isPure: false,
  } as Instance
  const instanceC = {
    incoming: [] as Array<DeclarationID>,
    outgoing: ['declaration C' as DeclarationID],
    invert: false,
    isPure: true,
  } as Instance
  const instanceD = {
    incoming: ['declaration A'] as Array<DeclarationID>,
    outgoing: ['declaration D' as DeclarationID, 'declaration E' as DeclarationID],
    invert: false,
    isPure: true,
  } as Instance
  const instanceE = {
    incoming: ['declaration A'] as Array<DeclarationID>,
    outgoing: ['declaration E' as DeclarationID],
    invert: false,
    isPure: true,
  } as Instance
  const instances: Array<Instance> = [instanceA, instanceB, instanceC, instanceD, instanceE]
  it('resolves to a single instance if it has not dependencies', () => {
    const declarations = ['declaration A' as DeclarationID]
    const result = deriveGeneratorInstances(instances, [], [], declarations)
    expect(result).toEqual([instanceA])
  })
  it('throws an error if declaration cannot be resolved', () => {
    const declarations = ['declaration B' as DeclarationID]
    expect(() => deriveGeneratorInstances(instances, [], [], declarations)).toThrow(
      'Instance combination cannot be determined.',
    )
  })
  it('picks a combination of lower number of nodes', () => {
    const declarations = ['declaration D' as DeclarationID, 'declaration E' as DeclarationID]
    const result = deriveGeneratorInstances(instances, [], [], declarations)
    expect(result).toEqual([instanceA, instanceD])
  })
  it('considers mandatory instances', () => {
    const mandatory = [instanceE]
    const declarations = ['declaration D' as DeclarationID, 'declaration E' as DeclarationID]
    const result = deriveGeneratorInstances(instances, mandatory, [], declarations)
    expect(result).toEqual([instanceA, instanceD, instanceE])
  })
})
