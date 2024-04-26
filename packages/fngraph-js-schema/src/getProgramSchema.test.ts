import fs from 'fs'
import path from 'path'

import ts from 'typescript'

import getProgramSchema from './getProgramSchema'

const testCases = (function () {
  const p = path.join(__dirname, '__testdata__')
  return fs
    .readdirSync(p)
    .filter((f) => f.endsWith('.ts.txt'))
    .map((f) => {
      const source = fs.readFileSync(path.join(p, f)).toString()
      return [f, source]
    })
})()

describe('getProgramSchema', () => {
  it.each(testCases)('properly extracts program schema from %p', (_name, source) => {
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2018,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      module: ts.ModuleKind.NodeNext,
      declaration: true,
      lib: ['es2018'],
      strict: true,
      strictNullChecks: true,
    }
    const host = ts.createCompilerHost(compilerOptions)
    const getSourceFile = host.getSourceFile.bind(host)
    Object.assign(host, {
      getSourceFile: function (
        name,
        options,
        onError,
        shouldCreateNewSourceFile,
      ): ts.SourceFile | undefined {
        if (name === 'program.ts') {
          return ts.createSourceFile(name, source, options)
        }
        return getSourceFile(name, options, onError, shouldCreateNewSourceFile)
      } satisfies ts.CompilerHost['getSourceFile'],
    })
    const schema = getProgramSchema('program.ts', compilerOptions, host)
    expect(schema).toMatchSnapshot()
  })
})
