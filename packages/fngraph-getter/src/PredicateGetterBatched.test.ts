import { DataRecord, DeclarationID } from '@fngraph/data'
import {
  contextAsRecord,
  createRecordGenerator,
  DataNodeSequence,
  recordAsContext,
} from '@fngraph/generator'

import { createConstant } from './ConstantValues'
import { createPredicateBatched } from './PredicateGetterBatched'
import { createDataNode } from './__fixtures__'

describe('createPredicateBatched', () => {
  const declarationA = 'declaration A' as DeclarationID
  const declarationB = 'declaration B' as DeclarationID
  it('iterates through getter records', async () => {
    const values = new Array(25).fill(0).map((_, i) => ({ [declarationA]: i }))
    const calls: Array<number> = []
    const nodeA = createDataNode({
      outgoing: [declarationA],
      getter: createConstant(values)(contextAsRecord, recordAsContext),
    })
    const nodeB = createDataNode({
      incoming: [declarationA],
      getter: createPredicateBatched((records) => {
        calls.push(records.length)
        const result = records.map((record) => {
          const value = record[declarationA] as number
          return value % 2 === 0
        })
        return Promise.resolve(result)
      }, 7)(contextAsRecord, recordAsContext),
    })
    const sequence = DataNodeSequence.create([nodeA, nodeB])
    const generator = createRecordGenerator(sequence, [])
    const records: Array<DataRecord> = []
    for await (const record of generator()) records.push(record)
    expect(records).toMatchSnapshot()
    expect(calls).toMatchSnapshot()
  })
  it('permutates records with another node', async () => {
    /**
     * Must result in the following evaluation sequence:
     *
     *   (B) <- (C) <- (A)
     *
     *        - or -
     *
     *   (B) <- (A) <- (C)
     */
    const values = new Array(25).fill(0).map((_, i) => ({ [declarationA]: i }))
    const calls: Array<number> = []
    const nodeA = createDataNode({
      outgoing: [declarationA],
      getter: createConstant(values)(contextAsRecord, recordAsContext),
    })
    const nodeB = createDataNode({
      incoming: [declarationA],
      getter: createPredicateBatched((records) => {
        calls.push(records.length)
        const result = records.map((record) => {
          const value = record[declarationA] as number
          return value % 2 === 0
        })
        return Promise.resolve(result)
      }, 7)(contextAsRecord, recordAsContext),
    })
    const nodeC = createDataNode({
      outgoing: [declarationB],
      getter: createConstant([{ [declarationB]: 10 }, { [declarationB]: 20 }])(
        contextAsRecord,
        recordAsContext,
      ),
    })
    const sequence = DataNodeSequence.create([nodeA, nodeB, nodeC])
    const generator = createRecordGenerator(sequence, [])
    const records: Array<DataRecord> = []
    for await (const record of generator()) records.push(record)
    expect(records).toMatchSnapshot()
    expect(calls).toMatchSnapshot()
  })
})
