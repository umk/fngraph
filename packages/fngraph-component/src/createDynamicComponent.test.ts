import Component from './Component'
import ComponentBuilder from './ComponentBuilder'
import { ComponentJsonSchema } from './ComponentSchema'
import DynamicComponentHandler from './DynamicComponentHandler'
import createDynamicComponent from './createDynamicComponent'
import createDynamicComponentBuilder from './createDynamicComponentBuilder'

jest.mock('./createDynamicComponentBuilder')

describe('createDynamicComponent', () => {
  const mockHandler: DynamicComponentHandler = jest.fn()

  it('should create component using createDynamicComponentBuilder when parameters provided in the schema', () => {
    const parameter: ComponentJsonSchema = { type: 'string' }
    const result: ComponentJsonSchema = { type: 'boolean' }
    const mockBuilder = {
      in: jest.fn(),
      out: jest.fn(),
      build: jest.fn().mockReturnValue({} as Component<never, never>),
    }

    mockBuilder.in.mockReturnValue(mockBuilder)
    mockBuilder.out.mockReturnValue(mockBuilder)

    jest
      .mocked(createDynamicComponentBuilder)
      .mockReturnValue(mockBuilder as unknown as ComponentBuilder<never, never>)

    const component = createDynamicComponent(mockHandler, parameter, result)

    // Ensure that createDynamicComponentBuilder is called with the correct arguments
    expect(createDynamicComponentBuilder).toHaveBeenCalledWith(
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
})
