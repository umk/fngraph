import {
  ComponentBuilder,
  ComponentSchema,
  createOneToMany,
  createOneToManyBatched,
  createOneToOne,
  createOneToOneBatched,
  createPredicate,
  createPredicateBatched,
} from '@fngraph/component'
import {
  OneToManyGetter,
  OneToManyGetterBatched,
  OneToOneGetter,
  OneToOneGetterBatched,
  PredicateGetter,
  PredicateGetterBatched,
} from '@fngraph/getter'

import ComponentHandler from './ComponentHandler'

function createComponentBuilder(
  handler: ComponentHandler,
  parameter: ComponentSchema,
  result: ComponentSchema | undefined,
): ComponentBuilder<never, never> | undefined {
  if (parameter.type === 'array') {
    if (parameter.items.type === 'object' && result?.type === 'array') {
      if (result.items.type === 'array') {
        if (result.items.items.type === 'object') {
          return createOneToManyBatched(handler as OneToManyGetterBatched<never, never>)
        }
      } else if (result.items.type === 'boolean') {
        return createPredicateBatched(handler as PredicateGetterBatched<never>)
      } else if (result.items.type === 'object') {
        return createOneToOneBatched(handler as OneToOneGetterBatched<never, never>)
      }
    }
  } else if (parameter.type === 'object') {
    if (result?.type === 'array') {
      if (result.items.type === 'object') {
        return createOneToMany(handler as OneToManyGetter<never, never>)
      }
    } else if (result?.type === 'boolean') {
      return createPredicate(handler as PredicateGetter<never>)
    } else if (result?.type === 'object') {
      return createOneToOne(handler as OneToOneGetter<never, never>)
    }
  }
  return undefined
}

export default createComponentBuilder
