import { Declaration, DeclarationID } from '@fngraph/data'

import Instance from './Instance'

/**
 * Creates a function, which gets instances, which can provide values
 * for provided declaration, along with these instances own dependencies.
 * @param instances A collection of instances in the data model
 * @param inputs A collection of declarations provided as an input to query
 * @returns
 * A function, which returns a collection of combinations of instances,
 * which participate in resolution of declaration value.
 */
function createGetSources(instances: Array<Instance>, inputs: Array<Declaration | DeclarationID>) {
  const inputIds = inputs.map((i) => (i instanceof Declaration ? i.id : i))
  const pureInstancesByOuts = instances.reduce((prev, cur, n) => {
    if (!cur.invert && cur.isPure) {
      for (const declarationId of cur.outgoing) {
        let instances = prev.get(declarationId)
        if (!instances) prev.set(declarationId, (instances = []))
        instances.push(n)
      }
    }
    return prev
  }, new Map<DeclarationID, Array<number>>())
  const results = new Map<DeclarationID, Array<Array<number>>>()
  const markers = new Array<boolean>(instances.length).fill(false)
  function getInstanceSources(n: number): Array<Array<number>> {
    if (markers[n]) return []
    markers[n] = true
    try {
      const instance = instances[n]
      return instance.incoming
        .reduce(
          (prev, cur) => {
            const incomingInst = getDeclarationSources(cur)
            return prev.flatMap((r) => incomingInst.map((i) => [...r, ...i]))
          },
          [[n]],
        )
        .map((r) => Array.from(new Set(r).values()))
    } finally {
      markers[n] = false
    }
  }
  function getDeclarationSources(
    declarationOrId: Declaration | DeclarationID,
  ): Array<Array<number>> {
    const declarationId = typeof declarationOrId === 'object' ? declarationOrId.id : declarationOrId
    if (inputIds.includes(declarationId)) return [[]]
    let result = results.get(declarationId)
    if (!result) {
      result = []
      const currentInst = pureInstancesByOuts.get(declarationId)
      if (currentInst) {
        for (const n of currentInst) {
          result.push(...getInstanceSources(n))
        }
      }
      results.set(declarationId, result)
    }
    return result
  }
  return {
    getInstanceSources: (instance: Instance) => {
      const index = instances.indexOf(instance)
      if (index === -1) throw new Error('Instance not found')
      return getInstanceSources(index)
    },
    getDeclarationSources,
  }
}

function getCombination(
  instances: Array<Instance>,
  combinations: Array<Array<Array<number>>>,
): Array<Instance> | undefined {
  function getCombination(
    n: number,
    markers: Array<boolean>,
    count: number,
    minCount: number,
  ): Array<Instance> {
    let result: Array<Instance> | undefined
    if (n === combinations.length) {
      result = markers.reduce((prev, cur, n) => {
        if (cur) prev.push(instances[n])
        return prev
      }, [] as Array<Instance>)
    } else {
      for (const combination of combinations[n]) {
        const currentMarkers = [...markers]
        let currentCount = count
        for (let i = 0; i < combination.length; i++) {
          const k = combination[i]
          if (!currentMarkers[k]) {
            currentMarkers[k] = true
            currentCount++
          }
        }
        if (currentCount < minCount) {
          const r = getCombination(n + 1, currentMarkers, currentCount, minCount)
          if (r) {
            result = r
            minCount = r.length
            if (r.length === 1) {
              break
            }
          }
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return result!
  }
  if (combinations.some((c) => c.length === 0)) {
    return undefined
  }
  const markers = new Array(instances.length).fill(false)
  return getCombination(0, markers, 0, Number.POSITIVE_INFINITY)
}

function deriveGeneratorInstances(
  instances: Array<Instance>,
  mandatory: Array<Instance>,
  inputs: Array<DeclarationID | Declaration>,
  outputs: Array<DeclarationID | Declaration>,
): Array<Instance> | undefined {
  const { getInstanceSources, getDeclarationSources } = createGetSources(instances, inputs)
  // A collection of output declarations which are still to
  // decide, which instance will provide them.
  const unresolvedOut = outputs
    .map((d) => (d instanceof Declaration ? d.id : d))
    .filter((d) => !mandatory.some((instance) => !instance.invert && instance.outgoing.includes(d)))
  const mandatoryCombs = mandatory.map(getInstanceSources)
  const unresolvedCombs = unresolvedOut.map(getDeclarationSources)
  const combinations = [...mandatoryCombs, ...unresolvedCombs]
  return getCombination(instances, combinations)
}

export default deriveGeneratorInstances
