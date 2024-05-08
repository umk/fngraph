import { Component, ComponentJsonSchema } from '@fngraph/component'
import { FunctionSchema } from '@fngraph/js-schema'

import ComponentHandler from './ComponentHandler'
import createComponentBuilder from './createComponentBuilder'

function createComponent(
  handler: ComponentHandler,
  schema: FunctionSchema,
): Component<never, never> {
  const {
    name,
    signature: { parameters, result },
  } = schema
  const parameter =
    parameters.length === 0
      ? ({ type: 'object', properties: {} } satisfies ComponentJsonSchema)
      : parameters[0].schema
  if (parameters.length <= 1) {
    const builder = createComponentBuilder(handler, parameter, result?.schema)
    if (builder) {
      builder.in(parameter).out(result?.schema)
      return builder.build()
    }
  }
  throw new Error(`Could not determine behavior of ${name}`)
}

export default createComponent
