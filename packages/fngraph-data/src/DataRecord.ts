import Primitive from './Primitive'

type DataRecord = Record<string, DataValue>

/**
 * A type for a value, which is stored in a data source.
 */
export type DataValue = Primitive | Array<DataValue> | { [key: string]: DataValue } | undefined

export default DataRecord
