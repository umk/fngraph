import { DataRecord, Declaration, DeclarationID } from '@fngraph/data'

import DataNode from './DataNode'
import GeneratorContext from './GeneratorContext'
import GeneratorValue from './GeneratorValue'
import { createGetContextRecord } from './GetContextRecord'
import { createMergeContexts } from './MergeContexts'
import PriorityQueue from './PriorityQueue'

type DataRecordGenerator = () => AsyncGenerator<DataRecord>

export function createDataRecordGenerator(
  nodes: Array<DataNode>,
  declarations: Array<Declaration>,
): DataRecordGenerator {
  const incomings = getIncomingNodes(nodes)
  const n = getOrderedNodes(nodes, incomings)
  const parentRefs = getParentRefs(n, incomings)
  const parentTrRefs = getParentTrRefs(n, parentRefs)
  const incomingDecls = Array.from(
    nodes.reduce((prev, cur) => {
      cur.incoming.forEach((d) => prev.add(d))
      return prev
    }, new Set<DeclarationID>()),
  )
  const mergeContexts = createMergeContexts(declarations)
  function createGeneratorAt(index: number): {
    iter: () => AsyncGenerator<GeneratorValue>
    isCached: boolean
  } {
    if (index === n.length) {
      let iter: () => AsyncGenerator<GeneratorValue>
      if (index === 0) {
        iter = async function* (): AsyncGenerator<GeneratorValue> {
          // Don't return anything
        }
      } else {
        iter = async function* (): AsyncGenerator<GeneratorValue> {
          yield {
            contexts: new Array(n.length).fill(undefined),
            n: n.length,
          }
        }
      }
      return { iter, isCached: false }
    }
    const upstreamIter = createGeneratorAt(index + 1)
    const currentRefs = parentRefs[index]
    const currentTrRefs = parentTrRefs[index].sort((a, b) => b - a)
    // Cache the node output if...
    const isCached =
      // ...upstream node is cached, or...
      upstreamIter.isCached ||
      // ...current node doesn't depend on anything, but is not the last node, or...
      (currentTrRefs.length === 0 && index < n.length - 1) ||
      // ...current node has a dependency, which is not an upstream node
      currentTrRefs[0] > index + 1
    const context = new GeneratorContext(index, currentTrRefs, isCached)
    const { getter, getProperties, invert } = n[index]
    const getRecord = createGetContextRecord(currentRefs, mergeContexts)
    const iter = function (): AsyncGenerator<GeneratorValue> {
      const records = upstreamIter.iter()
      const properties = getProperties(incomingDecls)
      return getter(properties, records, context, getRecord, invert)
    }
    return { iter, isCached }
  }
  const outputRefs = getOutputRefs(nodes, parentRefs)
  const getRecord = createGetContextRecord(outputRefs, mergeContexts)
  return async function* (): AsyncGenerator<DataRecord> {
    const current = createGeneratorAt(0)
    for await (const value of current.iter()) {
      const record = getRecord(value.contexts)
      if (record) yield record
    }
  }
}

function getIncomingNodes(nodes: Array<DataNode>) {
  return nodes.reduce((prev, cur) => {
    for (const incoming of cur.incoming) {
      let current = prev.get(incoming)
      if (!current) prev.set(incoming, (current = []))
      current.push(cur)
    }
    return prev
  }, new Map<DeclarationID, Array<DataNode>>())
}

function getOrderedNodes(
  nodes: Array<DataNode>,
  incomings: Map<DeclarationID, Array<DataNode>>,
): Array<DataNode> {
  const indexes = new Map(nodes.map((n) => [n, 0]))
  const pending = new PriorityQueue<DataNode>((a, b) => a.priority - b.priority)
  nodes.forEach((n) => pending.enqueue(n))
  for (;;) {
    const current = pending.dequeue()
    if (!current) break
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const i = indexes.get(current)!
    if (i === nodes.length) {
      throw new Error('The nodes have recursive dependency')
    }
    for (const outgoing of current.outgoing) {
      const n = incomings.get(outgoing)
      if (n) {
        for (const node of n) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          if (i >= indexes.get(node)!) {
            indexes.set(node, i + 1)
            pending.enqueue(node)
          }
        }
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return nodes.sort((a, b) => indexes.get(b)! - indexes.get(a)!)
}

function getParentRefs(
  nodes: Array<DataNode>,
  incomings: Map<DeclarationID, Array<DataNode>>,
): Array<Array<number>> {
  const parents = nodes.reduce(
    (prev, cur, i) => {
      for (const outgoing of cur.outgoing) {
        const incoming = incomings.get(outgoing)
        if (incoming) {
          for (const node of incoming) {
            const n = nodes.indexOf(node)
            prev[n].add(i)
          }
        }
      }
      prev.push(new Set())
      return prev
    },
    [] as Array<Set<number>>,
  )
  return parents.map((p) => Array.from(p))
}

function getParentTrRefs(
  nodes: Array<DataNode>,
  parentRefs: Array<Array<number>>,
): Array<Array<number>> {
  const r = parentRefs.map((u) => new Set<number>(u))
  for (let i = nodes.length - 1; i >= 0; i--) {
    const current = r[i]
    parentRefs[i].forEach((u) => {
      r[u].forEach((n) => current.add(n))
    })
  }
  return r.map((p) => Array.from(p))
}

function getOutputRefs(nodes: Array<DataNode>, parentRefs: Array<Array<number>>) {
  const incomings = new Array(nodes.length).fill(0)
  parentRefs.forEach((r) => r.forEach((n) => incomings[n]++))
  return incomings.reduce((prev, cur, i) => {
    if (cur === 0) prev.push(i)
    return prev
  }, [] as Array<number>)
}

export default DataRecordGenerator
