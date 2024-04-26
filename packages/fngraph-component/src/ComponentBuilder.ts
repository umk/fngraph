import { DataRecord } from '@fngraph/data'
import { GetterFactory } from '@fngraph/generator'
import {
  ConstantValues,
  createConstant as createConstantGetter,
  createOneToManyBatched as createOneToManyBatchedGetter,
  createOneToMany as createOneToManyGetter,
  createOneToOneBatched as createOneToOneBatchedGetter,
  createOneToOne as createOneToOneGetter,
  createPredicateBatched as createPredicateBatchedGetter,
  createPredicate as createPredicateGetter,
  GetterFunction,
  PredicateGetterFunction,
} from '@fngraph/getter'

import Component from './Component'
import ComponentSchema from './ComponentSchema'
import { InstancePriority } from './InstanceBuilder'

class ComponentBuilder<P extends DataRecord, R extends DataRecord> {
  private readonly _factory: GetterFactory<P, R>
  private readonly _isPure: boolean
  private readonly _priority: InstancePriority
  private _incoming: ComponentSchema | undefined
  private _outgoing: ComponentSchema | undefined
  constructor(factory: GetterFactory<P, R>, isPure: boolean, priority: InstancePriority) {
    if (!factory) throw new Error('getter factory is not defined')
    this._factory = factory
    this._isPure = isPure
    this._priority = priority
  }
  /**
   * Defines JSON schema representing the context of the getter invocation.
   * @param incoming A schema of incoming record
   * @returns Current builder
   */
  in(incoming: ComponentSchema | undefined): this {
    this._incoming = incoming
    return this
  }
  /**
   * A JSON schema representing the records returned from the getter.
   * This schema should not define any properties, which accepted as
   * an input.
   * @param outgoing A schema of outgoing record.
   * @returns Current builder
   */
  out(outgoing: ComponentSchema | undefined): this {
    this._outgoing = outgoing
    return this
  }
  /**
   * Builds an object describing a getter
   * @returns An object describing a getter
   */
  build(): Component<P, R> {
    if (!this._incoming) throw new Error('The incoming schema is not defined.')
    return new Component<P, R>(
      this._factory,
      this._isPure,
      this._priority,
      this._incoming,
      this._outgoing,
    )
  }
}

export type ComponentBuilderOf<S> =
  S extends GetterFunction<infer P, infer R>
    ? ComponentBuilder<P, R>
    : S extends PredicateGetterFunction<infer P>
      ? ComponentBuilder<P, never>
      : S extends ConstantValues<infer I extends DataRecord>
        ? ComponentBuilder<never, I>
        : never

export const createConstant = createFn(createConstantGetter, true, InstancePriority.DEFAULT)
export const createOneToOne = createFn(createOneToOneGetter, false, InstancePriority.DEFAULT)
export const createOneToOneBatched = createFn(
  createOneToOneBatchedGetter,
  false,
  InstancePriority.DEFAULT,
)
export const createOneToMany = createFn(createOneToManyGetter, false, InstancePriority.DEFAULT)
export const createOneToManyBatched = createFn(
  createOneToManyBatchedGetter,
  false,
  InstancePriority.DEFAULT,
)
export const createPredicate = createFn(createPredicateGetter, true, InstancePriority.PREDICATE)
export const createPredicateBatched = createFn(
  createPredicateBatchedGetter,
  true,
  InstancePriority.PREDICATE,
)

function createFn<S, Sp extends Array<unknown>, P extends DataRecord, R extends DataRecord>(
  f: (source: S, ...params: Sp) => GetterFactory<P, R>,
  defaultPure: boolean,
  priority: InstancePriority,
) {
  return function (source: S, isPure: boolean = defaultPure, ...params: Sp) {
    const factory = f(source, ...params)
    return new ComponentBuilder(factory, isPure, priority) as unknown as ComponentBuilderOf<S>
  }
}

export default ComponentBuilder
