import { DeclarationID } from '@fngraph/data'

import PropertyRef, { getUniqueRefs } from './PropertyRef'

type PropertiesGetter = (incomingDecls: Array<DeclarationID>) => Array<PropertyRef>

export function combinePropertiesGetters(getters: Array<PropertiesGetter>): PropertiesGetter {
  if (getters.length === 1) return getters[0]
  return function (incomingDecls: Array<DeclarationID>): Array<PropertyRef> {
    const refs = getters.flatMap((g) => g(incomingDecls))
    return getUniqueRefs(refs)
  }
}

export default PropertiesGetter
