import {
  ComponentSchema,
  createOneToMany,
  createOneToManyBatched,
  createOneToOne,
  createOneToOneBatched,
  createPredicate,
  createPredicateBatched,
} from '@fngraph/component'

import ComponentHandler from './ComponentHandler'
import createComponentBuilder from './createComponentBuilder'

jest.mock('@fngraph/component', () => ({
  createOneToMany: jest.fn(),
  createOneToManyBatched: jest.fn(),
  createOneToOne: jest.fn(),
  createOneToOneBatched: jest.fn(),
  createPredicate: jest.fn(),
  createPredicateBatched: jest.fn(),
}))

describe('createComponentBuilder', () => {
  const mockHandler: ComponentHandler = jest.fn()

  it('should return createOneToManyBatched when parameter type is array and result type is array of arrays of objects', () => {
    const parameter: ComponentSchema = { type: 'array', items: { type: 'object', properties: {} } }
    const result: ComponentSchema = {
      type: 'array',
      items: { type: 'array', items: { type: 'object', properties: {} } },
    }
    createComponentBuilder(mockHandler, parameter, result)
    expect(createOneToManyBatched).toHaveBeenCalledWith(mockHandler)
  })

  it('should return createOneToOneBatched when parameter type is array and result type is array of objects', () => {
    const parameter: ComponentSchema = { type: 'array', items: { type: 'object', properties: {} } }
    const result: ComponentSchema = { type: 'array', items: { type: 'object', properties: {} } }
    createComponentBuilder(mockHandler, parameter, result)
    expect(createOneToOneBatched).toHaveBeenCalledWith(mockHandler)
  })

  it('should return createPredicateBatched when parameter type is array and result type is array of booleans', () => {
    const parameter: ComponentSchema = { type: 'array', items: { type: 'object', properties: {} } }
    const result: ComponentSchema = { type: 'array', items: { type: 'boolean' } }
    createComponentBuilder(mockHandler, parameter, result)
    expect(createPredicateBatched).toHaveBeenCalledWith(mockHandler)
  })

  it('should return createOneToMany when parameter type is object and result type is array of objects', () => {
    const parameter: ComponentSchema = { type: 'object', properties: {} }
    const result: ComponentSchema = { type: 'array', items: { type: 'object', properties: {} } }
    createComponentBuilder(mockHandler, parameter, result)
    expect(createOneToMany).toHaveBeenCalledWith(mockHandler)
  })

  it('should return createOneToOne when parameter type is object and result type is object', () => {
    const parameter: ComponentSchema = { type: 'object', properties: {} }
    const result: ComponentSchema = { type: 'object', properties: {} }
    createComponentBuilder(mockHandler, parameter, result)
    expect(createOneToOne).toHaveBeenCalledWith(mockHandler)
  })

  it('should return createPredicate when parameter type is object and result type is boolean', () => {
    const parameter: ComponentSchema = { type: 'object', properties: {} }
    const result: ComponentSchema = { type: 'boolean' }
    createComponentBuilder(mockHandler, parameter, result)
    expect(createPredicate).toHaveBeenCalledWith(mockHandler)
  })

  it('should return undefined when parameter type is array and result type is not handled', () => {
    const parameter: ComponentSchema = { type: 'array', items: { type: 'object', properties: {} } }
    const result: ComponentSchema = { type: 'string' } // Unsupported result type
    const builder = createComponentBuilder(mockHandler, parameter, result)
    expect(builder).toBeUndefined()
  })

  it('should return undefined when parameter type is object and result type is not handled', () => {
    const parameter: ComponentSchema = { type: 'object', properties: {} }
    const result: ComponentSchema = { type: 'string' } // Unsupported result type
    const builder = createComponentBuilder(mockHandler, parameter, result)
    expect(builder).toBeUndefined()
  })

  it('should return undefined when parameter type is not handled', () => {
    const parameter: ComponentSchema = { type: 'number' } // Unsupported parameter type
    const result: ComponentSchema = { type: 'boolean' }
    const builder = createComponentBuilder(mockHandler, parameter, result)
    expect(builder).toBeUndefined()
  })
})
