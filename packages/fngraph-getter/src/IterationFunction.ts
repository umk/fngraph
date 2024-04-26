import { Context, DataRecord } from '@fngraph/data'
import { GeneratorContext, GeneratorValue, OutgoingMapper } from '@fngraph/generator'

type IterationFunction<D extends DataRecord> = (
  value: GeneratorValue,
  base: Context,
  derivations: D | Array<D>,
) => Generator<GeneratorValue>

export type IterationFactory<D extends DataRecord> = (
  context: GeneratorContext,
  invert: boolean,
) => IterationFunction<D>

export function createIteration<D extends DataRecord>(
  outgoing: OutgoingMapper<D>,
): IterationFactory<D> {
  return function (context: GeneratorContext, invert: boolean): IterationFunction<D> {
    if (!invert) {
      return function* (value: GeneratorValue, base: Context, derivations: D | Array<D>) {
        const d = Array.isArray(derivations) ? derivations : [derivations]
        let n = value.n
        for (const derived of d) {
          for (const r of outgoing(derived)) {
            value.contexts[context.nodeIndex] = { ...base, ...r }
            yield { contexts: value.contexts, n }
            n = context.nodeIndex
          }
        }
      }
    } else {
      return function* (value: GeneratorValue, base: Context) {
        // The derived value is assumed to be an empty object
        value.contexts[context.nodeIndex] = base
        yield value
      }
    }
  }
}

export default IterationFunction
