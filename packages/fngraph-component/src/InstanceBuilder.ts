import { Context, DataRecord, DeclarationID } from '@fngraph/data'
import {
  combinePropertiesGetters,
  contextAsRecord,
  IncomingMapper,
  OutgoingMapper,
  PropertiesGetter,
  PropertyRef,
  recordAsContext,
} from '@fngraph/generator'

import Component from './Component'
import ComponentSchema from './ComponentSchema'
import Instance from './Instance'
import Prototype, { createGetProperties } from './Prototype'
import Statement from './Statement'
import { getDeclarationsIds } from './getDeclarations'
import mapPrototype from './mapPrototype'
import mapStatement from './mapStatement'

function getSchemaProperties(schema: ComponentSchema): Array<string> {
  if (Array.isArray(schema)) return schema
  if (schema.type === 'array') return getSchemaProperties(schema.items)
  if (schema.type === 'object') return Object.getOwnPropertyNames(schema.properties)
  return []
}

export type InstanceIncoming<R extends DataRecord> = {
  /**
   * A collection of declarations required by mapper.
   */
  declarations: Array<DeclarationID>
  /**
   * The mapper function that transforms incoming declarations
   * to an object provided to getter.
   */
  mapper: IncomingMapper<R>
}

export type InstanceOutgoing<R extends DataRecord> = {
  /**
   * A collection of declarations, which values are produced
   * by mapper from getter output.
   */
  declarations: Array<DeclarationID>
  /**
   * The mapper function that transforms getter output to
   * outgoing declarations.
   */
  mapper: OutgoingMapper<R>
  /**
   * A function that produces a collection of properties to be
   * collected from the getter output based on other nodes inputs.
   */
  getProperties: PropertiesGetter
}

export enum InstancePriority {
  /**
   * The predicates are usually complete faster than
   * regular getter functions that may query external
   * sources.
   */
  PREDICATE = 1,
  /**
   * The inversion may be represented by both predicates
   * and regular getter functions.
   */
  INVERSION = 2,
  /**
   * The regular getter functions that a presumably slow
   * as they may rely on external sources.
   */
  DEFAULT = 3,
}

class InstanceBuilder<P extends DataRecord, R extends DataRecord> {
  private readonly _component: Component<P, R>
  private _priorityDef: InstancePriority
  private _priority: InstancePriority | number | undefined
  private _incoming: InstanceIncoming<P> | undefined
  private readonly _outgoing: Array<InstanceOutgoing<R>> = []
  private _invert = false
  constructor(component: Component<P, R>) {
    if (!component) throw new Error('component is not defined')
    this._component = component
    this._priorityDef = component.priority
  }
  in(incoming: InstanceIncoming<P>): this {
    this._incoming = incoming
    return this
  }
  inStatement(statement: Statement<P>): this {
    return this.in({
      mapper: mapStatement(statement),
      declarations: getDeclarationsIds(statement),
    })
  }
  out(outgoing: InstanceOutgoing<R>): this {
    this._outgoing.push(outgoing)
    return this
  }
  outPrototype(prototype: Prototype<R>): this {
    return this.out({
      mapper: mapPrototype(prototype),
      declarations: getDeclarationsIds(prototype),
      getProperties: createGetProperties(prototype),
    })
  }
  invert(invert = true): this {
    this._invert = invert
    return this
  }
  priority(priority: InstancePriority | number): this {
    this._priority = priority
    return this
  }
  build(): Instance {
    const incoming =
      this._incoming ||
      ({
        mapper: contextAsRecord,
        declarations: getSchemaProperties(this._component.incoming),
      } as InstanceIncoming<P>)
    const outgoing = this.getOutgoing()
    return {
      component: this._component as unknown as Component<never, never>,
      getter: this._component.factory(incoming.mapper, outgoing.mapper),
      priority: this._priority ?? (this._invert ? InstancePriority.INVERSION : this._priorityDef),
      incoming: incoming.declarations,
      outgoing: outgoing.declarations,
      invert: this._invert,
      isPure: this._component.isPure,
      getProperties: outgoing.getProperties,
    }
  }

  private *enumerateContexts(record: R, n: number): Generator<Context> {
    if (n === this._outgoing.length) {
      yield {} as Context
    } else {
      const { mapper } = this._outgoing[n]
      for (const a of mapper(record)) {
        B: for (const b of this.enumerateContexts(record, n + 1)) {
          const r = { ...b }
          for (const [declarationId, value] of Object.entries(a)) {
            if (declarationId in r) {
              if (r[declarationId as DeclarationID] !== value) continue B
            } else {
              r[declarationId as DeclarationID] = value
            }
          }
          yield r
        }
      }
    }
  }
  private getOutgoing(): InstanceOutgoing<R> {
    if (this._outgoing.length === 0) {
      const declarations = ((this._component.outgoing &&
        getSchemaProperties(this._component.outgoing)) ??
        []) as Array<DeclarationID>
      const getProperties = (incomingDecls: Array<DeclarationID>, invert: boolean) => {
        if (invert) return []
        return declarations
          .filter((d) => incomingDecls.includes(d as DeclarationID))
          .map((d) => [d] as PropertyRef)
      }
      return { mapper: recordAsContext, declarations, getProperties }
    }
    const declarations = Array.from(new Set(this._outgoing.flatMap((m) => m.declarations)))
    const mapper = (record: R) => this.enumerateContexts(record, 0)
    const getProperties = combinePropertiesGetters(this._outgoing.map((m) => m.getProperties))
    return { mapper, declarations, getProperties }
  }
}

export default InstanceBuilder
