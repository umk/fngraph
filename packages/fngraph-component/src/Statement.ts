import { DataValue, Declaration, Primitive } from '@fngraph/data'

type Statement<V = unknown> = DataValue extends V
  ? unknown
  :
      | Declaration
      | (V extends Primitive ? V : never)
      | (V extends Record<string, unknown> ? { [K in keyof V]: Statement<V[K]> } : never)

export default Statement
