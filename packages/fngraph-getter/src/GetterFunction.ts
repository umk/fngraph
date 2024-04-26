import { DataRecord } from '@fngraph/data'

import OneToManyGetter from './OneToManyGetter'
import OneToManyGetterBatched from './OneToManyGetterBatched'
import OneToOneGetter from './OneToOneGetter'
import OneToOneGetterBatched from './OneToOneGetterBatched'
import PredicateGetter from './PredicateGetter'
import PredicateGetterBatched from './PredicateGetterBatched'

type GetterFunction<P extends DataRecord, R extends DataRecord> =
  | OneToManyGetter<P, R>
  | OneToManyGetterBatched<P, R>
  | OneToOneGetter<P, R>
  | OneToOneGetterBatched<P, R>

export type PredicateGetterFunction<P extends DataRecord> =
  | PredicateGetter<P>
  | PredicateGetterBatched<P>

// export type ConstantGetterFunction<R extends DataRecord> = Constant

export default GetterFunction
