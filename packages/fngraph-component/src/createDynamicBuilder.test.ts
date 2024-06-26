import {
  createOneToMany,
  createOneToManyBatched,
  createOneToOne,
  createOneToOneBatched,
  createPredicate,
  createPredicateBatched,
} from './ComponentBuilder'
import ComponentSchema from './ComponentSchema'
import DynamicComponentHandler from './DynamicComponentHandler'
import createDynamicBuilder from './createDynamicBuilder'

jest.mock('./ComponentBuilder', () => ({
  createOneToMany: jest.fn(),
  createOneToManyBatched: jest.fn(),
  createOneToOne: jest.fn(),
  createOneToOneBatched: jest.fn(),
  createPredicate: jest.fn(),
  createPredicateBatched: jest.fn(),
}))

describe('createDynamicBuilder', () => {
  const mockHandler: DynamicComponentHandler = jest.fn()

  it('should return createOneToManyBatched when parameter type is array and result type is array of arrays of objects', () => {
    const parameter: ComponentSchema = { type: 'array', items: { type: 'object', properties: {} } }
    const result: ComponentSchema = {
      type: 'array',
      items: { type: 'array', items: { type: 'object', properties: {} } },
    }
    createDynamicBuilder(mockHandler, parameter, result)
    expect(createOneToManyBatched).toHaveBeenCalledWith(mockHandler, undefined)
  })

  it('should return createOneToOneBatched when parameter type is array and result type is array of objects', () => {
    const parameter: ComponentSchema = { type: 'array', items: { type: 'object', properties: {} } }
    const result: ComponentSchema = { type: 'array', items: { type: 'object', properties: {} } }
    createDynamicBuilder(mockHandler, parameter, result)
    expect(createOneToOneBatched).toHaveBeenCalledWith(mockHandler, undefined)
  })

  it('should return createPredicateBatched when parameter type is array and result type is array of booleans', () => {
    const parameter: ComponentSchema = { type: 'array', items: { type: 'object', properties: {} } }
    const result: ComponentSchema = { type: 'array', items: { type: 'boolean' } }
    createDynamicBuilder(mockHandler, parameter, result)
    expect(createPredicateBatched).toHaveBeenCalledWith(mockHandler, undefined)
  })

  it('should return createOneToMany when parameter type is object and result type is array of objects', () => {
    const parameter: ComponentSchema = { type: 'object', properties: {} }
    const result: ComponentSchema = { type: 'array', items: { type: 'object', properties: {} } }
    createDynamicBuilder(mockHandler, parameter, result)
    expect(createOneToMany).toHaveBeenCalledWith(mockHandler, undefined)
  })

  it('should return createOneToOne when parameter type is object and result type is object', () => {
    const parameter: ComponentSchema = { type: 'object', properties: {} }
    const result: ComponentSchema = { type: 'object', properties: {} }
    createDynamicBuilder(mockHandler, parameter, result)
    expect(createOneToOne).toHaveBeenCalledWith(mockHandler, undefined)
  })

  it('should return createPredicate when parameter type is object and result type is boolean', () => {
    const parameter: ComponentSchema = { type: 'object', properties: {} }
    const result: ComponentSchema = { type: 'boolean' }
    createDynamicBuilder(mockHandler, parameter, result)
    expect(createPredicate).toHaveBeenCalledWith(mockHandler, undefined)
  })

  it('should return undefined when parameter type is array and result type is not handled', () => {
    const parameter: ComponentSchema = { type: 'array', items: { type: 'object', properties: {} } }
    const result: ComponentSchema = { type: 'string' } // Unsupported result type
    const builder = createDynamicBuilder(mockHandler, parameter, result)
    expect(builder).toBeUndefined()
  })

  it('should return undefined when parameter type is object and result type is not handled', () => {
    const parameter: ComponentSchema = { type: 'object', properties: {} }
    const result: ComponentSchema = { type: 'string' } // Unsupported result type
    const builder = createDynamicBuilder(mockHandler, parameter, result)
    expect(builder).toBeUndefined()
  })

  it('should return undefined when parameter type is not handled', () => {
    const parameter: ComponentSchema = { type: 'number' } // Unsupported parameter type
    const result: ComponentSchema = { type: 'boolean' }
    const builder = createDynamicBuilder(mockHandler, parameter, result)
    expect(builder).toBeUndefined()
  })
})
