import { Context, DataRecord, DataValue, Declaration } from '@fngraph/data'
import { IncomingMapper } from '@fngraph/generator'

import Statement from './Statement'

function getStatementValue(statement: Statement, context: Context): DataRecord {
  function getDataValue(statement: Statement, context: Context): DataValue {
    if (statement instanceof Declaration) {
      return statement.get(context)
    } else if (statement instanceof Object) {
      const entries = Object.entries(statement).map(([key, value]) => {
        const dataValue = getDataValue(value, context)
        return [key, dataValue]
      })
      return Object.fromEntries(entries)
    } else {
      return statement as DataValue
    }
  }
  return getDataValue(statement, context) as DataRecord
}

function mapStatement<R extends DataRecord>(statement: Statement<R>): IncomingMapper<R> {
  return function (context: Context): R {
    return getStatementValue(statement, context) as R
  }
}

export default mapStatement
