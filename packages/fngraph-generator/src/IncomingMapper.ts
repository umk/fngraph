import { Context, DataRecord } from '@fngraph/data'

/**
 * A function that maps constants and output data of other
 * getters to inputs of current getter.
 * @param context The output data of other getters
 * @returns A data record in a format, expected by the getter
 */
type IncomingMapper<P extends DataRecord = DataRecord> = (context: Context) => P

export function contextAsRecord<P extends DataRecord>(context: Context): P {
  return context as unknown as P
}

export default IncomingMapper
