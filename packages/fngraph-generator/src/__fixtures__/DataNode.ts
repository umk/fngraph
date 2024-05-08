import DataNode from '../DataNode'

export function createDataNode(overrides?: Partial<DataNode>): DataNode {
  return {
    incoming: [],
    outgoing: [],
    getter: jest.fn(),
    priority: 0,
    invert: false,
    getProperties: () => [],
    ...overrides,
  }
}
