import { DataRecord, DeclarationID } from '@fngraph/data'
import { contextAsRecord, createDataRecordGenerator, recordAsContext } from '@fngraph/generator'

import { createConstant } from './ConstantValues'
import { createOneToMany } from './OneToManyGetter'
import { createDataNode } from './__fixtures__'

describe('createOneToMany', () => {
  const declarationA = 'declaration A' as DeclarationID
  const declarationB = 'declaration B' as DeclarationID
  const declarationC = 'declaration C' as DeclarationID
  const declarationD = 'declaration D' as DeclarationID
  it('iterates through getter records', async () => {
    const nodeA = createDataNode({
      outgoing: [declarationA, declarationB],
      getter: createConstant([
        { [declarationA]: 1, [declarationB]: 2 },
        { [declarationA]: 10, [declarationB]: 20 },
      ])(contextAsRecord, recordAsContext),
    })
    const nodeB = createDataNode({
      incoming: [declarationA, declarationB],
      outgoing: [declarationC],
      getter: createOneToMany((record) => {
        const valueA = record[declarationA] as number
        const valueB = record[declarationB] as number
        return (async function* () {
          yield { [declarationC]: valueA + valueB }
          yield { [declarationC]: valueA - valueB }
        })()
      })(contextAsRecord, recordAsContext),
    })
    const generator = createDataRecordGenerator([nodeA, nodeB], [])
    const records: Array<DataRecord> = []
    for await (const record of generator()) records.push(record)
    expect(records).toMatchSnapshot()
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
    const nodeA = createDataNode({
      outgoing: [declarationA, declarationB],
      getter: createConstant([
        { [declarationA]: 1, [declarationB]: 2 },
        { [declarationA]: 3, [declarationB]: 4 },
      ])(contextAsRecord, recordAsContext),
    })
    const getter = jest.fn((record) => {
      const valueA = record[declarationA] as number
      const valueB = record[declarationB] as number
      return (async function* () {
        yield { [declarationC]: valueA + valueB }
        yield { [declarationC]: valueA - valueB }
      })()
    })
    const nodeB = createDataNode({
      incoming: [declarationA, declarationB],
      outgoing: [declarationC],
      getter: createOneToMany(getter)(contextAsRecord, recordAsContext),
    })
    const nodeC = createDataNode({
      outgoing: [declarationD],
      getter: createConstant([{ [declarationD]: 10 }, { [declarationD]: 20 }])(
        contextAsRecord,
        recordAsContext,
      ),
    })
    const generator = createDataRecordGenerator([nodeA, nodeB, nodeC], [])
    const records: Array<DataRecord> = []
    for await (const record of generator()) records.push(record)
    expect(records).toMatchSnapshot()
    expect(getter).toHaveBeenCalledTimes(2)
  })
})
