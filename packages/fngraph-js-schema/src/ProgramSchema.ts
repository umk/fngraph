import { ComponentSchema } from '@fngraph/component'

type ProgramSchema = {
  functions: Array<FunctionSchema>
}

export type FunctionSchema = {
  name: string
  signature: Signature
}

export type Signature = {
  description?: string
  parameters: Array<SignatureParameter>
  result: SignatureResult | undefined
  required?: Array<string>
}

export type SignatureParameter = {
  name: string
  schema: ComponentSchema
}

export type SignatureResult = {
  description?: string
  schema: ComponentSchema
}

export default ProgramSchema
