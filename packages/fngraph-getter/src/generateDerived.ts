import { ContextGroupInversion, Falsy } from '@fngraph/generator'

async function* generateDerived<R>(
  derivations: AsyncGenerator<R | Falsy>,
  group: Array<R | ContextGroupInversion> | undefined,
) {
  for await (const derived of derivations) {
    if (derived) {
      group?.push(derived)
      yield derived
    }
  }
}

export default generateDerived
