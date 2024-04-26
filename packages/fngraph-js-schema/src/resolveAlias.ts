import ts from 'typescript'

function resolveAlias(checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol {
  while (symbol.flags & ts.SymbolFlags.Alias) {
    symbol = checker.getAliasedSymbol(symbol)
  }
  return symbol
}

export default resolveAlias
