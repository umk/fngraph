type PropertyRef = [string, ...Array<string>]

const UNIQUE_REF_MARKER = Symbol('unique ref marker')

export function getUniquePropertyRefs(refs: Array<PropertyRef>) {
  const result: Array<PropertyRef> = []
  const index = {} as Record<string | symbol, unknown>
  for (const ref of refs) {
    const current = ref.reduce((prev, cur) => {
      return (prev[cur] ??= {}) as typeof index
    }, index)
    if (!(UNIQUE_REF_MARKER in current)) {
      current[UNIQUE_REF_MARKER] = true
      result.push(ref)
    }
  }
  return result
}

export default PropertyRef
