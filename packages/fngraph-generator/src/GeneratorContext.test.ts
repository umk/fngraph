import GeneratorContext from './GeneratorContext'

describe('advanceToValueGroup', () => {
  it('properly advances group index upon transitive parent node events 1', () => {
    /**
     * Simulate events for node (0) in the following
     * dependency graph:
     *
     *        (3)
     *       /   \
     *    (1)     (2)
     *       \   /
     *        (0)
     *
     * Which results in the following evaluation sequence:
     *
     *  (0) <- (1) <- (2) <- (3)
     *
     * Nodes (1) and (2) are independent of each other and may come
     * in any order. The nodes have the following number of records
     * produced for each of their inputs:
     *
     *  (3) - 2
     *  (1) - 1
     *  (2) - 2
     */
    const nodeIndex = 0
    const parentTrRefs = [1, 2, 3] // nodes (1) (2) (3)
    const isCached = false
    const events: Array<number> = [4, 2, 3, 2]

    const context = new GeneratorContext(nodeIndex, parentTrRefs, isCached)

    events.forEach((n) => {
      context.advanceToValueGroup({ contexts: [], n })
      context.groupIndex++
    })

    expect(context.groupIndex).toEqual(4)
  })
  it('properly advances group index upon transitive parent node events 2', () => {
    /**
     * Simulate events for node (0) in the following
     * dependency graph:
     *
     *        (3)
     *       /   \
     *    (1)     (2)
     *       \   /
     *        (0)-(5)
     *
     * Which results in the following evaluation sequence:
     *
     *  (0) <- (1) <- (2) <- (5) <- (3)
     *
     * Nodes (1), (2) and (5) are independent of each other and may
     * come in any order. The nodes have the following number of
     * records produced for each of their inputs:
     *
     *  (3) - 2
     *  (5) - 2
     *  (1) - 1
     *  (2) - 2
     */
    const nodeIndex = 0
    const parentTrRefs = [1, 2, 3, 4] // nodes (1) (2) (5) (3)
    const isCached = false
    const events: Array<number> = [5, 2, 3, 2, 4, 2, 3, 2]

    const context = new GeneratorContext(nodeIndex, parentTrRefs, isCached)

    events.forEach((n) => {
      context.advanceToValueGroup({ contexts: [], n })
      context.groupIndex++
    })

    expect(context.groupIndex).toEqual(8)
  })
  it('properly advances group index upon non-parent node events', () => {
    /**
     * Simulate events for node (0) in the following
     * dependency graph:
     *
     *        (3)
     *       /   \
     *    (1)     (2)
     *       \   /
     *        (0) (5)
     *
     * Which results in the following evaluation sequence:
     *
     *  (0) <- (1) <- (2) <- (5) <- (3)
     *
     * Nodes (1), (2) and (5) are independent of each other and may
     * come in any order. The nodes have the following number of
     * records produced for each of their inputs:
     *
     *  (3) - 2
     *  (5) - 2
     *  (1) - 1
     *  (2) - 2
     */
    const nodeIndex = 0
    const parentTrRefs = [1, 2, 4] // nodes (1) (2) (3)
    const isCached = false
    const events: Array<number> = [5, 2, 3, 2, 4, 2, 3, 2]

    const context = new GeneratorContext(nodeIndex, parentTrRefs, isCached)

    events.forEach((n) => {
      context.advanceToValueGroup({ contexts: [], n })
      context.groupIndex++
    })

    expect(context.groupIndex).toEqual(4)
  })
})
