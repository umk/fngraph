import { PropertyRef } from '@fngraph/generator'

type GetterPrototype<P extends Record<string, unknown>, R> = <
  V extends Partial<P>,
  O extends Record<string, unknown>,
>(
  overrides?: V | ((options: O) => V),
) => (record: Omit<P, keyof V> & O, properties: Array<PropertyRef>) => R

export function createGetterPrototype<P extends Record<string, unknown>, R>(
  getter: (record: P, properties: Array<PropertyRef>) => R,
): GetterPrototype<P, R> {
  return function <V extends Partial<P>, O extends Record<string, unknown>>(
    overrides?: V | ((options: O) => V),
  ) {
    if (typeof overrides === 'function') {
      return function (record: Omit<P, keyof V> & O, properties: Array<PropertyRef>): R {
        const overrides_ = overrides(record)
        const record_ = { ...record, ...overrides_ }
        return getter(record_ as P, properties)
      }
    } else {
      return function (record: Omit<P, keyof V>, properties: Array<PropertyRef>): R {
        const record_ = { ...record, ...overrides }
        return getter(record_ as P, properties)
      }
    }
  }
}

export default GetterPrototype
