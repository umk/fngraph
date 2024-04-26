import ts from 'typescript'

import NotSupportedError from './NotSupportedError'
import ProgramSchema, { FunctionSchema, Signature } from './ProgramSchema'
import generateSchema from './generateSchema'
import getDescription from './getDescription'
import getDescriptionByTag from './getDescriptionByTag'
import resolveAlias from './resolveAlias'

function getSourceFileSchema(sourceFile: ts.SourceFile, checker: ts.TypeChecker): ProgramSchema {
  const functions: Array<FunctionSchema> = []
  const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile)
  if (sourceFileSymbol) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const exports = checker.getExportsOfModule(sourceFileSymbol!)
    exports.forEach((symbol) => {
      symbol = resolveAlias(checker, symbol)
      if (symbol.flags & ts.SymbolFlags.Function) {
        try {
          functions.push(generateFunctionSchema(checker, symbol))
        } catch (error) {
          if (error instanceof NotSupportedError) {
            console.warn(`Could not create a function for ${symbol.name}: ${error.message}`)
          } else {
            throw error
          }
        }
      }
    })
  }
  return { functions }
}

function generateFunctionSchema(checker: ts.TypeChecker, symbol: ts.Symbol): FunctionSchema {
  function getSignatureSchema(signature: ts.Signature): Signature {
    const required: Array<string> = []
    const returnType = signature.getReturnType()
    const resultSchema = generateSchema(checker, undefined, returnType)
    return {
      parameters: signature.parameters.map((p) => {
        const parameterSchema = generateSchema(checker, p)
        if (!parameterSchema) {
          throw new NotSupportedError(`Cannot determine schema for parameter ${p.name}`)
        }
        const { schema, isRequired } = parameterSchema
        if (isRequired) required.push(p.name)
        return { name: p.name, schema }
      }),
      result: resultSchema && {
        schema: resultSchema.schema,
        description:
          getDescriptionByTag(signature, 'yields') || getDescriptionByTag(signature, 'returns'),
      },
      description: getDescription(checker, signature),
      required,
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
  const signatures_ = type.getCallSignatures()
  if (signatures_.length === 0) throw new Error('Value of provided type is not callable')
  const n = Math.max(...signatures_.map((s) => s.parameters.length))
  const signatures = signatures_.filter((s) => s.parameters.length === n)
  if (signatures.length !== 1) {
    throw new NotSupportedError(`Cannot determine a single signature out of ${signatures_.length}`)
  }
  const signature = getSignatureSchema(signatures[0])
  return { name: symbol.name, signature }
}

export default getSourceFileSchema
