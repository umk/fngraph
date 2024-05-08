import { ComponentJsonSchema } from '@fngraph/component'
import ts from 'typescript'

import NotSupportedError from './NotSupportedError'
import getDescription from './getDescription'
import resolveAlias from './resolveAlias'

function generateSchema(
  checker: ts.TypeChecker,
  symbol: ts.Symbol | undefined,
  type?: ts.Type,
):
  | {
      /** The schema generated against provided type */
      schema: ComponentJsonSchema
      /** Indicates whether the value is required */
      isRequired: boolean
    }
  | undefined {
  function generateSchema(
    symbol: ts.Symbol | undefined,
    type?: ts.Type,
  ): { schema: ComponentJsonSchema; isRequired: boolean } | undefined {
    if (type) return generateSchemaByType(symbol, type)
    if (!symbol) throw new Error('Either symbol or type must be provided')
    symbol = resolveAlias(checker, symbol)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
    return generateSchemaByType(symbol, type)
  }
  function generateSchemaByType(
    symbol: ts.Symbol | undefined,
    type: ts.Type,
  ): { schema: ComponentJsonSchema; isRequired: boolean } | undefined {
    const description = symbol && getDescription(checker, symbol)
    if (type.flags & ts.TypeFlags.Object) {
      if (
        type.symbol?.name === 'Promise' &&
        ['then', 'catch'].every((p) => (type.getProperty(p)?.flags || 0) & ts.SymbolFlags.Method)
      ) {
        const argumentz = checker.getTypeArguments(type as ts.TypeReference)
        if (argumentz.length === 1) {
          const [argument] = argumentz
          return generateSchemaByType(argument.symbol, argument)
        }
      }
      return {
        schema: { ...generateObjectSchema(type), description },
        isRequired: true,
      }
    }
    if (type.isUnion()) {
      const types = type.types.filter((t) => !(t.flags & ts.TypeFlags.VoidLike))
      // Were there any types removed as being undefined?
      const isRequired = types.length === type.types.length
      if (
        types.length === 1 ||
        // A special case of a boolean represented as a union of true + false
        types.every((t) => t.flags & ts.TypeFlags.BooleanLike)
      ) {
        const [current] = types
        const schema = generateSchemaByType(current.symbol, current)
        return schema && { ...schema, isRequired }
      } else {
        const { flags, values } = resolveUnion(type)
        const primitiveType = resolvePrimitiveType(flags)
        return (
          primitiveType && {
            schema: {
              type: primitiveType,
              enum: values,
              description,
            },
            isRequired,
          }
        )
      }
    } else {
      const primitiveType = resolvePrimitiveType(type.flags)
      return (
        primitiveType && {
          schema: {
            type: primitiveType,
            description,
          },
          isRequired: true,
        }
      )
    }
  }
  function getArrayItemType(type: ts.Type): ts.Type | undefined {
    const index = type.getNumberIndexType()
    if (index) return index
    if (type.flags & ts.TypeFlags.Object) {
      if (
        type.symbol &&
        ['Generator', 'AsyncGenerator', 'Iterator', 'AsyncIterator'].includes(type.symbol.name) &&
        (type.getProperty('next')?.flags || 0) & ts.SymbolFlags.Method
      ) {
        const argumentz = checker.getTypeArguments(type as ts.TypeReference)
        if (argumentz.length > 0) return argumentz[0]
      }
    }
    return undefined
  }
  function generateObjectSchema(type: ts.Type): ComponentJsonSchema {
    const item = getArrayItemType(type)
    if (item) {
      const itemSchema = generateSchema(item.symbol, item)
      if (!itemSchema) throw new NotSupportedError('Cannot determine schema for array item.')
      return { type: 'array', items: itemSchema.schema }
    }
    const required: Array<string> = []
    const properties = type.getProperties().reduce(
      (prev, cur) => {
        const description = getDescription(checker, cur)
        const propertySchema = generateSchema(cur)
        if (!propertySchema) throw new NotSupportedError(`Cannot determine schema for ${cur.name}`)
        const { schema, isRequired } = propertySchema
        if (isRequired) required.push(cur.name)
        schema.description =
          [description, schema.description].filter(Boolean).join(' ') || undefined
        prev[cur.name] = schema
        return prev
      },
      {} as Record<string, ComponentJsonSchema>,
    )
    return { type: 'object', properties, required }
  }
  function resolvePrimitiveType(flags: ts.TypeFlags) {
    if (flags & ts.TypeFlags.StringLike) {
      return 'string' as const
    } else if (flags & ts.TypeFlags.NumberLike) {
      return 'number' as const
    } else if (flags & ts.TypeFlags.BooleanLike) {
      return 'boolean' as const
    } else if (flags & ts.TypeFlags.VoidLike) {
      return undefined
    }
    throw new NotSupportedError('Could not determine schema for the data type')
  }
  function resolveUnion(type: ts.UnionType): {
    /** Bitwise AND of the union members flags */
    flags: ts.TypeFlags
    /** The values assignable to variable of the union type */
    values?: Array<string | number>
  } {
    const values = type.types.map(
      (cur) => {
        if (!cur.isLiteral()) {
          throw new NotSupportedError('The union value can only be represented by a literal')
        }
        const value = cur.value
        if (typeof value === 'string' || typeof value === 'number') {
          return value
        }
        throw new NotSupportedError('The union value must be a string or number')
      },
      [] as Array<string | number>,
    )
    const flags = type.types.reduce((prev, cur) => prev & cur.flags, -1 as ts.TypeFlags)
    if (flags === (0 as ts.TypeFlags)) {
      throw new NotSupportedError('The union must be represented by values of the same type')
    }
    return { flags, values }
  }
  return generateSchema(symbol, type)
}

export default generateSchema
