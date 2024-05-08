import { DataRecord, Declaration, DeclarationID } from '@fngraph/data'

import DataNode from './DataNode'
import { createDataRecordGenerator } from './DataRecordGenerator'
import GeneratorValue from './GeneratorValue'
import Getter from './Getter'
import { createDataNode } from './__fixtures__'

function createGetter(values: Array<DataRecord>): Getter {
  return async function* (
    _properties,
    records,
    context,
    getRecord,
    invert,
  ): AsyncGenerator<GeneratorValue> {
    if (invert) throw new Error('inversion is not supported')
    for await (const current of records) {
      context.advanceToValueGroup(current)
      const base = getRecord(current.contexts)
      if (base) {
        let n = current.n
        for (const v of values) {
          current.contexts[context.nodeIndex] = { ...base, ...v }
          yield { contexts: current.contexts, n }
          n = context.nodeIndex
        }
      }
    }
  }
}

describe('createDataRecordGenerator', () => {
  const declarationA = 'declaration A' as DeclarationID
  const declarationB = 'declaration B' as DeclarationID
  const declarationC = 'declaration C' as DeclarationID

  it('throws an error if nodes have recursive dependencies', () => {
    const nodeA: DataNode = createDataNode({ incoming: [declarationA], outgoing: [declarationB] })
    const nodeB: DataNode = createDataNode({ incoming: [declarationB], outgoing: [declarationA] })

    expect(() => createDataRecordGenerator([nodeA, nodeB], [])).toThrowErrorMatchingSnapshot()
  })
  it('throws an error nodes has a dependency on itself', () => {
    const nodeA: DataNode = createDataNode({ incoming: [declarationA], outgoing: [declarationA] })

    expect(() => createDataRecordGenerator([nodeA], [])).toThrowErrorMatchingSnapshot()
  })
  it("doesn't return anything if there are no nodes", async () => {
    const nodes: Array<DataNode> = []
    const declarations: Array<Declaration> = []

    const generator = createDataRecordGenerator(nodes, declarations)
    const records = generator()

    const { done } = await records.next()

    expect(done).toBe(true)
  })
  it('iterates through getter records', async () => {
    const nodeA = createDataNode({
      outgoing: [declarationA, declarationB],
      getter: createGetter([
        { [declarationA]: 1, [declarationB]: 2 },
        { [declarationA]: 10, [declarationB]: 20 },
      ]),
    })
    const nodeB = createDataNode({
      incoming: [declarationA, declarationB],
      outgoing: [declarationC],
      getter: createGetter([
        { [declarationC]: 3 },
        { [declarationC]: 30 },
        { [declarationC]: 300 },
      ]),
    })
    const generator = createDataRecordGenerator([nodeA, nodeB], [])
    const records: Array<DataRecord> = []
    for await (const record of generator()) records.push(record)
    expect(records).toMatchSnapshot()
  })
})
