import { DataRecord } from '@fngraph/data'

import Falsy from './Falsy'
import GeneratorValue from './GeneratorValue'

export type ContextGroup<R extends DataRecord = DataRecord> = R | ContextGroupInversion | Falsy

export type ContextArrayGroup<R extends DataRecord = DataRecord> = Array<R | ContextGroupInversion>

export type ContextGroupInversion = Record<string, never>

export const CONTEXT_GROUP_INVERSION: ContextGroupInversion = {}

class GeneratorContext {
  /**
   * The cached records produced by a getter cached for
   * reuse during permutations. Can be array for one-to-many
   * getters and a data record for one-to-one getters.
   * Assigned to undefined if parent record could not be
   * determined.
   */
  public readonly groups: Array<ContextGroup | ContextArrayGroup> = []
  /**
   * The stacked indexes indicating beginning of the group
   * of records produced by each of the node parent nodes,
   * direct or indirect.
   */
  public readonly groupIndexes: Array<number>
  /**
   * Current index of the record in a collection of records.
   * Incremented outside of the context when reading cached
   * record or when adding a record to collection of cached
   * records.
   */
  public groupIndex = 0
  /**
   * @param nodeIndex An index of the node the context was created for
   * @param parentTrRefs A collection of indexes of parent nodes, direct and indirect. The indexes are determined in the ordered collection of nodes
   * @param isCached Indicates whether the getter values are cached in order to be reused for permutations
   */
  constructor(
    public readonly nodeIndex: number,
    public readonly parentTrRefs: ReadonlyArray<number>,
    public readonly isCached: boolean,
  ) {
    this.groupIndexes = new Array(parentTrRefs.length).fill(0)
  }
  advanceToValueGroup(value: GeneratorValue) {
    // An index of the group set when current node was left
    const previousIndex = this.groupIndex
    let i = 0
    for (; i < this.parentTrRefs.length; i++) {
      const ref = this.parentTrRefs[i]
      if (ref >= value.n) {
        // If one of the parent nodes was advanced the last time...
        if (ref === value.n) {
          // ...advance index to the next group of records
          this.groupIndex = previousIndex
        } else {
          // ...otherwise groups of records must be reused for
          // permutation, so index remains at the beginning
          // of a parent node group
        }
        break
      }
      this.groupIndex = this.groupIndexes[i]
    }
    // Specify the lower boundary for the group, represented by
    // just incremented node of one of the parent nodes, in child
    // nodes.
    for (i--; i >= 0; i--) {
      this.groupIndexes[i] = this.groupIndex
    }
  }
}

export default GeneratorContext
