import { DataRecord } from '@fngraph/data'
import { GetterFactory } from '@fngraph/generator'

import ComponentSchema from './ComponentSchema'
import InstanceBuilder, { InstancePriority } from './InstanceBuilder'

/**
 * A component represents a building block of a data model. The
 * building blocks are composed based on their inputs and outputs
 * into a directed graph without loops where each node of the
 * graph either derives new data from input data or produces data
 * on its own without any inputs.
 */
class Component<P extends DataRecord, R extends DataRecord> {
  private readonly _factory: GetterFactory<P, R>
  private readonly _isPure: boolean
  private readonly _priority: InstancePriority
  private readonly _incoming: ComponentSchema
  private readonly _outgoing: ComponentSchema | undefined
  constructor(
    factory: GetterFactory<P, R>,
    isPure: boolean,
    priority: InstancePriority,
    incoming: ComponentSchema,
    outgoing: ComponentSchema | undefined,
  ) {
    this._factory = factory
    this._isPure = isPure
    this._priority = priority
    this._incoming = incoming
    this._outgoing = outgoing
  }
  /**
   * Gets a function, that accepts the context values and returns
   * records, derived from that context. The getter may not require
   * any context values, but still will be called with at least
   * default empty context.
   */
  get factory() {
    return this._factory
  }
  /**
   * Gets a value indicating whether or not component getter
   * has side effects.
   */
  get isPure() {
    return this._isPure
  }
  /**
   * Gets default priority of instances of this component.
   */
  get priority() {
    return this._priority
  }
  /**
   * A JSON schema representing the context of the getter invocation.
   */
  get incoming() {
    return this._incoming
  }
  /**
   * A JSON schema representing the records returned from the getter.
   * This schema should not define any properties, which accepted as
   * an input.
   *
   * Can be not defined if getter doesn't produce any values.
   */
  get outgoing() {
    return this._outgoing
  }
  /**
   * Creates a new builder of an instance based on current component.
   */
  instance(): InstanceBuilder<P, R> {
    return new InstanceBuilder(this)
  }
}

export default Component
