import { Context, DataRecord } from '@fngraph/data'
import { GeneratorContext, GeneratorValue, OutgoingMapper } from '@fngraph/generator'

type IterationFunction<D extends DataRecord> = (
  value: GeneratorValue,
  base: Context,
  derivations: D | Array<D> | AsyncGenerator<D>,
) => AsyncGenerator<GeneratorValue>

export type IterationFactory<D extends DataRecord> = (
  context: GeneratorContext,
  invert: boolean,
) => IterationFunction<D>

export function createIteration<D extends DataRecord>(
  outgoing: OutgoingMapper<D>,
): IterationFactory<D> {
  return function (context: GeneratorContext, invert: boolean): IterationFunction<D> {
    if (!invert) {
      return async function* (
        value: GeneratorValue,
        base: Context,
        derivations: D | Array<D> | AsyncGenerator<D>,
      ) {
        const d =
          Array.isArray(derivations) || Symbol.asyncIterator in derivations
            ? derivations
            : [derivations]
        let n = value.n
        for await (const derived of d) {
          for (const r of outgoing(derived)) {
            value.contexts[context.nodeIndex] = { ...base, ...r }
            yield { contexts: value.contexts, n }
            n = context.nodeIndex
          }
        }
      }
    } else {
      return async function* (value: GeneratorValue, base: Context) {
        // The derived value is assumed to be an empty object
        value.contexts[context.nodeIndex] = base
        yield value
      }
    }
  }
}

export default IterationFunction
