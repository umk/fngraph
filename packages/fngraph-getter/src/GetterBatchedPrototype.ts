import { PropertyRef } from '@fngraph/generator'

type GetterBatchedPrototype<P extends Record<string, unknown>, R> = <
  V extends Partial<P>,
  O extends Record<string, unknown>,
>(
  overrides?: V | ((options: O) => V),
) => (records: Array<Omit<P, keyof V> & O>, properties: Array<PropertyRef>) => R

export function createGetterBatchedPrototype<P extends Record<string, unknown>, R>(
  getter: (record: Array<P>, properties: Array<PropertyRef>) => R,
): GetterBatchedPrototype<P, R> {
  return function <V extends Partial<P>, O extends Record<string, unknown>>(
    overrides?: V | ((options: O) => V),
  ) {
    if (typeof overrides === 'function') {
      return function (records: Array<Omit<P, keyof V> & O>, properties: Array<PropertyRef>): R {
        const records_ = records.map((r) => ({ ...r, ...overrides(r) }) as P)
        return getter(records_, properties)
      }
    } else {
      return function (records: Array<Omit<P, keyof V>>, properties: Array<PropertyRef>): R {
        const records_ = records.map((r) => ({ ...r, ...overrides }) as P)
        return getter(records_, properties)
      }
    }
  }
}

export default GetterBatchedPrototype
