/**
 * Implements a subset of JSON schema features supported by
 * the application.
 */
type ComponentSchema = ComponentSchemaProperties | ComponentJsonSchema

export type ComponentSchemaProperties = Array<string>

export type ComponentJsonSchema = {
  description?: string
} & (ComponentSchemaObject | ComponentSchemaArray | ComponentSchemaPrimitive)

export type ComponentSchemaObject = {
  type: 'object'
  properties: Record<string, ComponentJsonSchema>
  required?: Array<string>
}

export type ComponentSchemaArray = {
  type: 'array'
  items: ComponentJsonSchema
}

export type ComponentSchemaPrimitive = {
  type: 'string' | 'number' | 'integer' | 'boolean'
  enum?: Array<string | number | boolean>
}

export default ComponentSchema
