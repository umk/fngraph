import { Declaration, DeclarationID } from '@fngraph/data'

function getDeclarations(value: unknown): Array<Declaration> {
  const declarations = new Set<Declaration>()
  function getDecls(value: unknown) {
    if (value instanceof Declaration) declarations.add(value)
    else if (Array.isArray(value)) value.forEach(getDecls)
    else if (value instanceof Object) Object.values(value).forEach(getDecls)
  }
  getDecls(value)
  return Array.from(declarations.values())
}

export function getDeclarationsIds(value: unknown): Array<DeclarationID> {
  const declarationsIds = new Set<DeclarationID>()
  getDeclarations(value).forEach((d) => declarationsIds.add(d.id))
  return Array.from(declarationsIds.values())
}

export default getDeclarations
