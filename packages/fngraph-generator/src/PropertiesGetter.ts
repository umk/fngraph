import { DeclarationID } from '@fngraph/data'

import PropertyRef, { getUniqueRefs } from './PropertyRef'

type PropertiesGetter = (incomingDecls: Array<DeclarationID>, invert: boolean) => Array<PropertyRef>

export function combinePropertiesGetters(getters: Array<PropertiesGetter>): PropertiesGetter {
  if (getters.length === 1) return getters[0]
  return function (incomingDecls: Array<DeclarationID>, invert: boolean): Array<PropertyRef> {
    const refs = getters.flatMap((g) => g(incomingDecls, invert))
    return getUniqueRefs(refs)
  }
}

export default PropertiesGetter
