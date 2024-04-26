import { Component, ComponentBuilder } from '@fngraph/component'
import { FunctionSchema } from '@fngraph/js-schema'

import ComponentHandler from './ComponentHandler'
import createComponent from './createComponent'
import createComponentBuilder from './createComponentBuilder'

jest.mock('./createComponentBuilder')

describe('createComponent', () => {
  const mockHandler: ComponentHandler = jest.fn()

  it('should create component using createComponentBuilder when parameters provided in the schema', () => {
    const schema: FunctionSchema = {
      name: 'testFunction',
      signature: {
        parameters: [{ name: 'param1', schema: { type: 'string' } }],
        result: { schema: { type: 'boolean' } },
      },
    }
    const mockBuilder = {
      in: jest.fn(),
      out: jest.fn(),
      build: jest.fn().mockReturnValue({} as Component<never, never>),
    }

    mockBuilder.in.mockReturnValue(mockBuilder)
    mockBuilder.out.mockReturnValue(mockBuilder)

    jest
      .mocked(createComponentBuilder)
      .mockReturnValue(mockBuilder as unknown as ComponentBuilder<never, never>)

    const component = createComponent(mockHandler, schema)

    // Ensure that createComponentBuilder is called with the correct arguments
    expect(createComponentBuilder).toHaveBeenCalledWith(
      mockHandler,
      { type: 'string' },
      { type: 'boolean' },
    )
    // Ensure that the builder's methods are called correctly
    expect(mockBuilder.in).toHaveBeenCalledWith({ type: 'string' })
    expect(mockBuilder.out).toHaveBeenCalledWith({ type: 'boolean' })
    // Ensure that the component is built
    expect(component).toBeDefined()
  })

  it('should throw error when multiple parameters are provided in the schema', () => {
    const schema: FunctionSchema = {
      name: 'testFunction',
      signature: {
        parameters: [
          { name: 'param1', schema: { type: 'string' } },
          { name: 'param2', schema: { type: 'number' } },
        ],
        result: { schema: { type: 'boolean' } },
      },
    }

    expect(() => createComponent(mockHandler, schema)).toThrow(
      'Could not determine behavior of testFunction',
    )
  })
})
