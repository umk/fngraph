import { Context } from '@fngraph/data'

type GeneratorValue = {
  /**
   * An index of node in an ordered array of nodes that has
   * advanced the last time.
   */
  n: number
  /**
   * The contexts that has been accepted the last time by
   * respective nodes in an ordered collection of nodes. A node
   * can be undefined if the context declarations conflict with
   * declarations of its parent contexts.
   */
  contexts: GeneratorValueContexts
}

export type GeneratorValueContexts = Array<Context | undefined>

export default GeneratorValue
