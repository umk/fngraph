import { DataRecord, DeclarationID } from '@fngraph/data'
import {
  contextAsRecord,
  createRecordGenerator,
  DataNodeSequence,
  recordAsContext,
} from '@fngraph/generator'

import { createConstant } from './ConstantValues'
import { createOneToManyBatched } from './OneToManyGetterBatched'
import { createDataNode } from './__fixtures__'

describe('createOneToManyBatched', () => {
  const declarationA = 'declaration A' as DeclarationID
  const declarationB = 'declaration B' as DeclarationID
  const declarationC = 'declaration C' as DeclarationID
  const declarationD = 'declaration D' as DeclarationID
  it('iterates through getter records', async () => {
    const values = new Array(25).fill(0).map((_, i) => ({
      [declarationA]: i * 2 + 1,
      [declarationB]: i * 2 + 2,
    }))
    const calls: Array<number> = []
    const nodeA = createDataNode({
      outgoing: [declarationA, declarationB],
      getter: createConstant(values)(contextAsRecord, recordAsContext),
    })
    const nodeB = createDataNode({
      incoming: [declarationA, declarationB],
      outgoing: [declarationC],
      getter: createOneToManyBatched((records) => {
        calls.push(records.length)
        const result = records.map((record) => {
          const valueA = record[declarationA] as number
          const valueB = record[declarationB] as number
          return [{ [declarationC]: valueA + valueB }, { [declarationC]: valueA - valueB }]
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
    const values = new Array(10).fill(0).map((_, i) => ({
      [declarationA]: i * 2 + 1,
      [declarationB]: i * 2 + 2,
    }))
    const calls: Array<number> = []
    const nodeA = createDataNode({
      outgoing: [declarationA, declarationB],
      getter: createConstant(values)(contextAsRecord, recordAsContext),
    })
    const getter = jest.fn((records: Array<DataRecord>) => {
      calls.push(records.length)
      const result = records.map((record) => {
        const valueA = record[declarationA] as number
        const valueB = record[declarationB] as number
        return [{ [declarationC]: valueA + valueB }, { [declarationC]: valueA - valueB }]
      })
      return Promise.resolve(result)
    })
    const nodeB = createDataNode({
      incoming: [declarationA, declarationB],
      outgoing: [declarationC],
      getter: createOneToManyBatched(getter, 3)(contextAsRecord, recordAsContext),
    })
    const nodeC = createDataNode({
      outgoing: [declarationD],
      getter: createConstant([{ [declarationD]: 10 }, { [declarationD]: 20 }])(
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
