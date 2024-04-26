/**
 * Implements a subset of JSON schema features supported by
 * the application.
 */
type ComponentSchema = {
  description?: string
} & (ComponentSchemaObject | ComponentSchemaArray | ComponentSchemaPrimitive)

export type ComponentSchemaObject = {
  type: 'object'
  properties: Record<string, ComponentSchema>
  required?: Array<string>
}

export type ComponentSchemaArray = {
  type: 'array'
  items: ComponentSchema
}

export type ComponentSchemaPrimitive = {
  type: 'string' | 'number' | 'integer' | 'boolean'
  enum?: Array<string | number | boolean>
}

export default ComponentSchema
