import Component from './Component'
import { ComponentJsonSchema } from './ComponentSchema'
import DynamicComponentHandler from './DynamicComponentHandler'
import createDynamicComponentBuilder from './createDynamicComponentBuilder'

function createDynamicComponent(
  handler: DynamicComponentHandler,
  parameter: ComponentJsonSchema = { type: 'object', properties: {} },
  result: ComponentJsonSchema = { type: 'boolean' },
): Component<never, never> {
  const builder = createDynamicComponentBuilder(handler, parameter, result)
  if (!builder) throw new Error('Could not determine behavior of the handler function')
  builder.in(parameter).out(result)
  return builder.build()
}

export default createDynamicComponent
