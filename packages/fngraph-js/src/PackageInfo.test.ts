import { Stats } from 'fs'
import fs from 'fs/promises'
import path from 'path'

import { getPackageInfo } from './PackageInfo'

// Define a mocked package.json content for testing purposes
const mockedPackageJsonContent = JSON.stringify({
  name: 'test-package',
  version: '1.0.0',
  description: 'Test package',
  types: 'index.d.ts',
})

// Mock fs methods for testing
jest.mock('fs/promises', () => ({
  stat: jest.fn(),
  readFile: jest.fn(),
}))

describe('getPackageInfo', () => {
  const packagePath = '/path/to/package'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return package info when package.json exists and contains necessary fields', async () => {
    // Mock fs.stat to return a file
    jest.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as Stats)

    // Mock fs.readFile to return the mocked package.json content
    jest.mocked(fs.readFile).mockResolvedValue(Buffer.from(mockedPackageJsonContent))

    const packageInfo = await getPackageInfo(packagePath)

    expect(packageInfo).toEqual({
      name: 'test-package',
      version: '1.0.0',
      description: 'Test package',
      types: 'index.d.ts',
    })
    expect(fs.stat).toHaveBeenCalledWith(path.join(packagePath, 'package.json'))
    expect(fs.readFile).toHaveBeenCalledWith(path.join(packagePath, 'package.json'))
  })

  it('should throw error if package.json is not a file', async () => {
    // Mock fs.stat to return a directory
    jest.mocked(fs.stat).mockResolvedValue({ isFile: () => false } as Stats)

    await expect(getPackageInfo(packagePath)).rejects.toThrow('The package.json is not a file')
  })

  it("should throw error if package.json doesn't exist", async () => {
    // Mock fs.stat to throw ENOENT error
    jest.mocked(fs.stat).mockRejectedValue({ code: 'ENOENT' })

    await expect(getPackageInfo(packagePath)).rejects.toThrow(
      "The directory doesn't contain a package.json file",
    )
  })

  it('should throw error if package.json is missing name or version', async () => {
    // Mock fs.stat to return a file
    jest.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as Stats)

    // Mock fs.readFile to return invalid package.json content
    jest.mocked(fs.readFile).mockResolvedValue(Buffer.from('{}'))

    await expect(getPackageInfo(packagePath)).rejects.toThrow(
      'The package.json is missing a name or version',
    )
  })

  it('should throw error if package.json is invalid JSON', async () => {
    // Mock fs.stat to return a file
    jest.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as Stats)

    // Mock fs.readFile to return invalid JSON content
    jest.mocked(fs.readFile).mockResolvedValue(Buffer.from('invalid-json'))

    await expect(getPackageInfo(packagePath)).rejects.toThrow('Cannot parse package.json file')
  })
})
