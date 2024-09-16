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
import { ComponentJsonSchema, resolveJsonSchemaRef } from './ComponentSchema'
import DynamicComponentHandler from './DynamicComponentHandler'

function createDynamicBuilder(
  handler: DynamicComponentHandler,
  parameter: ComponentJsonSchema,
  result: ComponentJsonSchema,
  isPure?: boolean,
): ComponentBuilder<never, never> | undefined {
  parameter = resolveJsonSchemaRef(parameter)
  result = resolveJsonSchemaRef(result)
  if ('type' in parameter && 'type' in result) {
    if (parameter.type === 'array') {
      const parameterItems = resolveJsonSchemaRef(parameter.items, parameter)
      if ('type' in parameterItems && parameterItems.type === 'object' && result.type === 'array') {
        const resultItems = resolveJsonSchemaRef(result.items, result)
        if ('type' in resultItems) {
          if (resultItems.type === 'array') {
            const resultItemsItems = resolveJsonSchemaRef(resultItems.items, result)
            if ('type' in resultItemsItems && resultItemsItems.type === 'object') {
              return createOneToManyBatched(handler as OneToManyGetterBatched<never, never>, isPure)
            }
          } else if (resultItems.type === 'boolean') {
            return createPredicateBatched(handler as PredicateGetterBatched<never>, isPure)
          } else if (resultItems.type === 'object') {
            return createOneToOneBatched(handler as OneToOneGetterBatched<never, never>, isPure)
          }
        }
      }
    } else if (parameter.type === 'object') {
      if (result.type === 'array') {
        const resultItems = resolveJsonSchemaRef(result.items, result)
        if ('type' in resultItems && resultItems.type === 'object') {
          return createOneToMany(handler as OneToManyGetter<never, never>, isPure)
        }
      } else if (result.type === 'boolean') {
        return createPredicate(handler as PredicateGetter<never>, isPure)
      } else if (result.type === 'object') {
        return createOneToOne(handler as OneToOneGetter<never, never>, isPure)
      }
    }
  }
  return undefined
}

export default createDynamicBuilder
