import { DataRecord, DeclarationID } from '@fngraph/data'
import { Getter } from '@fngraph/generator'

import Component from './Component'
import InstanceBuilder from './InstanceBuilder'

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
}

export type InstanceConfig<P extends DataRecord, R extends DataRecord> = (
  builder: InstanceBuilder<P, R>,
) => void

export type InstanceConfigOf<C> =
  C extends Component<infer P, infer R> ? InstanceConfig<P, R> : never

export function instance<P extends DataRecord, R extends DataRecord>(
  component: Component<P, R>,
  ...configs: Array<InstanceConfig<P, R>>
): Instance {
  const builder = component.instance()
  configs.forEach((c) => c(builder))
  return builder.build()
}

export default Instance
