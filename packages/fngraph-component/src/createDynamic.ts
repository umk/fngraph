import ComponentBuilder from './ComponentBuilder'
import { ComponentJsonSchema } from './ComponentSchema'
import DynamicComponentHandler from './DynamicComponentHandler'
import createDynamicBuilder from './createDynamicBuilder'

function createDynamic(
  handler: DynamicComponentHandler,
  parameter: ComponentJsonSchema = { type: 'object', properties: {} },
  result: ComponentJsonSchema = { type: 'boolean' },
  isPure?: boolean,
): ComponentBuilder<never, never> {
  const builder = createDynamicBuilder(handler, parameter, result, isPure)
  if (!builder) throw new Error('Could not determine behavior of the handler function')
  return builder.in(parameter).out(result)
}

export default createDynamic
