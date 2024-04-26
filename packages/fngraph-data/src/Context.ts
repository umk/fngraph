import { DataValue } from './DataRecord'
import { DeclarationID } from './Declaration'

type Context = Record<DeclarationID, DataValue> & { __brand: 'context' }

export default Context
