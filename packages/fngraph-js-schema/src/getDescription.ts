import ts from 'typescript'

function getDescription(
  checker: ts.TypeChecker,
  symbol: ts.Symbol | ts.Signature,
): string | undefined {
  const description = ts.displayPartsToString(symbol.getDocumentationComment(checker))
  return description || undefined
}

export default getDescription
