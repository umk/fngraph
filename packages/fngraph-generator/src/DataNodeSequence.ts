import { DeclarationID } from '@fngraph/data'

import DataNode from './DataNode'
import PriorityQueue from './PriorityQueue'

class DataNodeSequence<N extends DataNode = DataNode> {
  private constructor(
    public readonly nodes: Array<N>,
    /**
     * @internal
     */
    public readonly incomings: Map<DeclarationID, Array<N>>,
  ) {}
  static create<N extends DataNode>(nodes: Array<N>) {
    const incomings = getIncomingNodes(nodes)
    const n = getOrderedNodes(nodes, incomings)
    return new DataNodeSequence<N>(n, incomings)
  }
}

function getIncomingNodes<N extends DataNode>(nodes: Array<N>) {
  return nodes.reduce((prev, cur) => {
    for (const incoming of cur.incoming) {
      let current = prev.get(incoming)
      if (!current) prev.set(incoming, (current = []))
      current.push(cur)
    }
    return prev
  }, new Map<DeclarationID, Array<N>>())
}

function getOrderedNodes<N extends DataNode>(
  nodes: Array<N>,
  incomings: Map<DeclarationID, Array<N>>,
): Array<N> {
  const indexes = new Map(nodes.map((n) => [n, 0]))
  const pending = new PriorityQueue<N>((a, b) => a.priority - b.priority)
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

export default DataNodeSequence
