import Context from './Context'
import Conversion from './Conversion'
import { DataValue } from './DataRecord'

export type DeclarationOptions = {
  /**
   * A conversion function, that performs normalization of
   * the declaration value before matching between two values.
   */
  conversion?: Conversion
}

/**
 * A placeholder for a value queried from a data source.
 */
class Declaration {
  private readonly _id: DeclarationID
  private readonly _conversion?: Conversion
  constructor(id: DeclarationID, options?: DeclarationOptions) {
    this._id = id
    this._conversion = options?.conversion
  }
  /**
   * Gets a unique identifier of the declaration.
   */
  get id() {
    return this._id
  }
  /**
   * Gets a value bound to the declaration. If the value is not defined,
   * throws an error.
   * @param context A query context to get the value from
   * @returns A value bound to the declaration
   */
  get(context: Context): DataValue {
    const value = context[this.id]
    if (value === undefined) {
      throw new Error('Declaration value is not defined in the context.')
    }
    return value
  }
  /**
   * Gets a value bound to the declaration. If the value is not defined,
   * returns an undefined value.
   * @param context A query context to get the value from
   * @returns A value bound to the declaration, or undefined value.
   */
  getOrDefault(context: Context): DataValue | undefined
  /**
   * Gets a value bound to the declaration. If the value is not defined,
   * returns a default value.
   * @param context A query context to get the value from
   * @param defaultVal A default value
   * @returns A value bound to the declaration, or default value.
   */
  getOrDefault<D>(context: Context, defaultVal: D): DataValue | D
  getOrDefault(context: Context, defaultVal?: unknown): unknown {
    return context[this.id] || defaultVal
  }
  /**
   * Sets a value bound to the declaration, optionally converted to its
   * resulting representation if converter is defined.
   * @param context A query context to set the value to
   * @param value A value to be bound to the declaration
   */
  set(context: Context, value: DataValue): void {
    if (this.id in context) {
      throw new Error(`The declaration "${this.id}" value is already set.`)
    }
    // Treat the value as matching the declaration type even if there
    // is no conversion defined for declaration.
    let current = value
    if (this._conversion && !(current instanceof Declaration)) {
      const previous = context[this.id]
      current = this._conversion(current, previous)
    }
    context[this.id] = current
  }
  /**
   * Ensures that the value is bound to the declaration. If no value was
   * bound to the declaration, binds the value to the declaration.
   * Otherwise checks that the value is the same as the one already bound
   * to the declaration by using strict shallow comparison.
   * @param context A query context to set the value to
   * @param value A value to be bound to the declaration
   * @returns A value indicating whether provided value has been bound to the declaration.
   */
  ensure(context: Context, value: DataValue): boolean {
    const previous = context[this.id]
    let current = value
    if (this._conversion) {
      current = this._conversion(value, previous)
    }
    if (previous) {
      return previous === current
    }
    context[this.id] = current
    return true
  }
  /**
   * Compares declaration values in two contexts. The declaration
   * must present in both contexts before comparing. Otherwise an
   * error is thrown.
   * @param a The first context to take compared value from.
   * @param b The second context to take compared value from.
   */
  compare(a: Context, b: Context): boolean {
    const valueA = this.get(a)
    const valueB = this.get(b)
    return this._conversion ? this._conversion(valueA, valueB) === valueA : valueA === valueB
  }
  /**
   * Gets a value indicating whether current declaration value
   * is provided in the context.
   * @param context The context to check value in.
   * @returns true if value is provided in the context; otherwise false.
   */
  in(context: Context): boolean {
    return this.id in context
  }
}

export type DeclarationID = string & { __brand: 'declaration ID' }

export default Declaration
