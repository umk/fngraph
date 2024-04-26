import { DeclarationID } from '@fngraph/data'

import Getter from './Getter'

type DataNode = {
  /**
   * Declarations which values the node depends on.
   */
  incoming: Array<DeclarationID>
  /**
   * Declarations which values are produced by the node.
   */
  outgoing: Array<DeclarationID>
  /**
   * A function that actually produces declarations based on
   * combinations of incoming declarations.
   */
  getter: Getter
  /**
   * Indicates whether node output is inverted. The inverted
   * nodes cannot have outgoing declarations as they just
   * serve as a predicate for incoming declarations.
   */
  invert: boolean
  /**
   * The priority the node is invoked. Higher number means the
   * node is invoked later.
   */
  priority: number
}

export default DataNode
