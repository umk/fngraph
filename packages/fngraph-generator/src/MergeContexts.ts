import { Context, Declaration, DeclarationID } from '@fngraph/data'

type MergeContexts = (records: Array<Context | undefined>) => Context | undefined

export function createMergeContexts(declarations: ReadonlyArray<Declaration>): MergeContexts {
  const declarationsById = declarations.reduce(
    (prev, cur) => prev.set(cur.id, cur),
    new Map<DeclarationID, Declaration>(),
  )
  function mergeContexts(base: Context, record: Context): Context | undefined {
    const result = { ...base }
    for (const [id, value] of Object.entries(record)) {
      const declaration = declarationsById.get(id as DeclarationID)
      if (declaration) {
        if (!declaration.ensure(result, value)) return undefined
      } else {
        if (id in result && result[id as DeclarationID] !== value) return undefined
        result[id as DeclarationID] = value
      }
    }
    return result
  }
  return function (records: Array<Context | undefined>): Context | undefined {
    if (records.length === 1) return records[0]
    if (records.some((c) => !c)) return undefined
    let merged: Context | undefined = {} as Context
    for (const record of records) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (!(merged = mergeContexts(merged, record!))) {
        return undefined
      }
    }
    return merged
  }
}

export default MergeContexts
