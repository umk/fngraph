import { DeclarationID } from '@fngraph/data'
import { Getter } from '@fngraph/generator'
import { PropertiesGetter } from '@fngraph/generator'

import Component from './Component'

type Instance = {
  /**
   * A component that the instance is built upon.
   */
  component: Component<never, never>
  /**
   * A function that actually produces declarations based on
   * combinations of incoming declarations.
   */
  getter: Getter
  /**
   * The priority the node is invoked. Higher number means the
   * node is invoked later.
   */
  priority: number
  /**
   * Declarations which values the node depends on.
   */
  incoming: Array<DeclarationID>
  /**
   * Declarations which values are produced by the node.
   */
  outgoing: Array<DeclarationID>
  /**
   * Indicates whether node output is inverted. The inverted
   * nodes cannot have outgoing declarations as they just
   * serve as a predicate for incoming declarations.
   */
  invert: boolean
  /**
   * Indicates whether or not instance getter has side effects.
   */
  isPure: boolean
  /**
   * A function that produces a collection of properties to be
   * collected from the getter output based on other nodes inputs.
   */
  getProperties: PropertiesGetter
}

export default Instance
