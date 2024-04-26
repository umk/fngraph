import ts from 'typescript'

function getDescriptionByTag(symbol: ts.Symbol | ts.Signature, tag: string): string | undefined {
  const tags = symbol.getJsDocTags()
  const t = tags.find((t) => t.name === tag)
  return t && ts.displayPartsToString(t.text)
}

export default getDescriptionByTag
