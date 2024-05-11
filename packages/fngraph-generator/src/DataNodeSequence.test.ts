import { DeclarationID } from '@fngraph/data'

import DataNode from './DataNode'
import DataNodeSequence from './DataNodeSequence'
import { createDataNode } from './__fixtures__'

describe('DataNodeSequence', () => {
  const declarationA = 'declaration A' as DeclarationID
  const declarationB = 'declaration B' as DeclarationID

  it('throws an error if nodes have recursive dependencies', () => {
    const nodeA: DataNode = createDataNode({ incoming: [declarationA], outgoing: [declarationB] })
    const nodeB: DataNode = createDataNode({ incoming: [declarationB], outgoing: [declarationA] })

    expect(() => DataNodeSequence.create([nodeA, nodeB])).toThrowErrorMatchingSnapshot()
  })

  it('throws an error nodes has a dependency on itself', () => {
    const nodeA: DataNode = createDataNode({ incoming: [declarationA], outgoing: [declarationA] })

    expect(() => DataNodeSequence.create([nodeA])).toThrowErrorMatchingSnapshot()
  })
})
