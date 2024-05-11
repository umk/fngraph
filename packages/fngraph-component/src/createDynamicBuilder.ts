import {
  OneToManyGetter,
  OneToManyGetterBatched,
  OneToOneGetter,
  OneToOneGetterBatched,
  PredicateGetter,
  PredicateGetterBatched,
} from '@fngraph/getter'

import ComponentBuilder, {
  createOneToMany,
  createOneToManyBatched,
  createOneToOne,
  createOneToOneBatched,
  createPredicate,
  createPredicateBatched,
} from './ComponentBuilder'
import { ComponentJsonSchema } from './ComponentSchema'
import DynamicComponentHandler from './DynamicComponentHandler'

function createDynamicBuilder(
  handler: DynamicComponentHandler,
  parameter: ComponentJsonSchema,
  result: ComponentJsonSchema,
  isPure?: boolean,
): ComponentBuilder<never, never> | undefined {
  if (parameter.type === 'array') {
    if (parameter.items.type === 'object' && result.type === 'array') {
      if (result.items.type === 'array') {
        if (result.items.items.type === 'object') {
          return createOneToManyBatched(handler as OneToManyGetterBatched<never, never>, isPure)
        }
      } else if (result.items.type === 'boolean') {
        return createPredicateBatched(handler as PredicateGetterBatched<never>, isPure)
      } else if (result.items.type === 'object') {
        return createOneToOneBatched(handler as OneToOneGetterBatched<never, never>, isPure)
      }
    }
  } else if (parameter.type === 'object') {
    if (result.type === 'array') {
      if (result.items.type === 'object') {
        return createOneToMany(handler as OneToManyGetter<never, never>, isPure)
      }
    } else if (result.type === 'boolean') {
      return createPredicate(handler as PredicateGetter<never>, isPure)
    } else if (result.type === 'object') {
      return createOneToOne(handler as OneToOneGetter<never, never>, isPure)
    }
  }
  return undefined
}

export default createDynamicBuilder
