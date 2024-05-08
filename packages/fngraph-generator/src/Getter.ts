import { DataRecord } from '@fngraph/data'

import GeneratorContext from './GeneratorContext'
import GeneratorValue from './GeneratorValue'
import GetContextRecord from './GetContextRecord'
import IncomingMapper from './IncomingMapper'
import OutgoingMapper from './OutgoingMapper'
import PropertyRef from './PropertyRef'

/**
 * Creates a getter function with incoming and outgoing declarations
 * that respective mappers operate
 * @param incoming The incoming declarations mapper
 * @param outgoing The outgoing declarations mapper
 * @returns A getter function
 */
export type GetterFactory<P extends DataRecord, R extends DataRecord> = (
  incoming: IncomingMapper<P>,
  outgoing: OutgoingMapper<R>,
) => Getter

/**
 * A function, which iterates over the records and derives new
 * data against each of the record. Upon yield the getter must
 * update the indexes array in a context to reflect global unique
 * location of the resulting record.
 * @param properties A collection of properties to be collected from the getter output
 * @param records A collection of records over which to derive the values
 * @param context A node iterator context
 * @param getRecord A function which gets a context record from generator value
 * @param invert Indicates whether the getter output is inverted
 */
type Getter = (
  properties: Array<PropertyRef>,
  records: AsyncGenerator<GeneratorValue>,
  context: GeneratorContext,
  getRecord: GetContextRecord,
  invert: boolean,
) => AsyncGenerator<GeneratorValue>

/**
 * The default max number of items to be fed into a batched
 * getter.
 */
export const DEFAULT_MAX_BATCH = 10

/**
 * Default number of generator values preloaded into buffer
 * in order to extract unique records that fed into a batched
 * getter.
 */
export const DEFAULT_MAX_BUFFER = 1000

export default Getter
