import { DeclarationID } from '@fngraph/data'
import { Getter } from '@fngraph/generator'
import { PropertiesGetter } from '@fngraph/generator'

import Component from './Component'
import { InstanceIncoming, InstanceOutgoing, InstancePriority } from './InstanceBuilder'

class Instance {
  /**
   * A component that the instance is built upon.
   */
  public readonly component: Component<never, never>

  /**
   * A function that actually produces declarations based on
   * combinations of incoming declarations.
   */
  public readonly getter: Getter

  /**
   * The priority the node is invoked. Higher number means the
   * node is invoked later.
   */
  public readonly priority: number

  /**
   * Declarations which values the node depends on.
   */
  public readonly incoming: Array<DeclarationID>

  /**
   * Declarations which values are produced by the node.
   */
  public readonly outgoing: Array<DeclarationID>

  /**
   * Indicates whether node output is inverted. The inverted
   * nodes cannot have outgoing declarations as they just
   * serve as a predicate for incoming declarations.
   */
  public readonly invert: boolean

  /**
   * Indicates whether or not instance getter has side effects.
   */
  public readonly isPure: boolean

  /**
   * A function that produces a collection of properties to be
   * collected from the getter output based on other nodes inputs.
   */
  public readonly getProperties: PropertiesGetter

  constructor(
    component: Component<never, never>,
    priority: InstancePriority | number | undefined,
    invert: boolean,
    incoming: InstanceIncoming<never>,
    outgoing: InstanceOutgoing<never>,
  ) {
    this.component = component
    this.getter = component.factory(incoming.mapper, outgoing.mapper)
    this.priority = priority ?? (invert ? InstancePriority.INVERSION : component.priority)
    this.incoming = incoming.declarations
    this.outgoing = outgoing.declarations
    this.invert = invert
    this.isPure = component.isPure
    this.getProperties = outgoing.getProperties
  }
}

export default Instance
