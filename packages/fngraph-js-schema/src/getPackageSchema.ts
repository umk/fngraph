import * as path from 'path'

import ProgramSchema from './ProgramSchema'
import getProgramSchema from './getProgramSchema'
import readTsconfig from './readTsconfig'

async function getPackageSchema(
  packagePath: string,
  packageTypes: string,
): Promise<ProgramSchema | undefined> {
  const tsconfigPath = path.join(packagePath, 'tsconfig.json')
  const tsconfig = readTsconfig(tsconfigPath)
  const rootName = path.resolve(packagePath, packageTypes)
  return getProgramSchema(rootName, {
    ...tsconfig.options,
    // Required to emit the undefined type by type checker
    strictNullChecks: true,
  })
}

export default getPackageSchema
