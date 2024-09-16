/**
 * Implements a subset of JSON schema features supported by
 * the application.
 */
type ComponentSchema = ComponentSchemaProperties | ComponentJsonSchema

export type ComponentSchemaProperties = Array<string>

export type ComponentJsonSchema = {
  description?: string
  $defs?: ComponentSchemaDefinitions
} & (
  | ComponentSchemaAny
  | ComponentSchemaObject
  | ComponentSchemaArray
  | ComponentSchemaPrimitive
  | ComponentSchemaRef
)

export type ComponentSchemaConcrete = ComponentJsonSchema &
  (ComponentSchemaObject | ComponentSchemaArray | ComponentSchemaPrimitive)

export type ComponentSchemaType = ComponentSchemaConcrete['type']

export type ComponentSchemaDefinitions = Record<string, ComponentJsonSchema>

export type ComponentSchemaAny = Record<string, never>

export type ComponentSchemaObject = {
  type: 'object'
  properties?: Record<string, ComponentJsonSchema>
  required?: Array<string>
  additionalProperties?: ComponentJsonSchema
}

export type ComponentSchemaArray = {
  type: 'array'
  items: ComponentJsonSchema
}

export type ComponentSchemaPrimitive = {
  type: 'string' | 'number' | 'integer' | 'boolean'
  enum?: Array<string | number | boolean>
}

export const COMPONENT_SCHEMA_REF_PREFIX = '#/$defs/' as const

export type ComponentSchemaRef = { $ref: `${typeof COMPONENT_SCHEMA_REF_PREFIX}${string}` }

export function resolveJsonSchemaRef(schema: ComponentJsonSchema, root = schema) {
  for (let current = schema; ; ) {
    if ('$ref' in schema) {
      const name = schema.$ref.substring(COMPONENT_SCHEMA_REF_PREFIX.length)
      const current_ = root.$defs?.[name]
      if (!current_) throw new Error(`Could not resolve reference ${schema.$ref}.`)
      current = current_
    }
    return current
  }
}

export default ComponentSchema
