import * as path from 'path'

import ts from 'typescript'

/**
 * Function to read and parse tsconfig.json
 */
function readTsconfig(tsconfigPath: string): ts.ParsedCommandLine {
  // Parse tsconfig.json using the TypeScript API
  const tsconfig = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
  if (tsconfig.error) {
    throw new Error(`Error reading tsconfig.json: ${tsconfig.error.messageText}`)
  }

  // Parse additional configuration options (e.g., includes and excludes)
  const parseConfigHost: ts.ParseConfigHost = {
    useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
    readDirectory: ts.sys.readDirectory,
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    tsconfig.config,
    parseConfigHost,
    path.basename(tsconfigPath),
  )

  return parsedConfig
}

export default readTsconfig
