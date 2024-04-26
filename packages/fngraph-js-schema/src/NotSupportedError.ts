class NotSupportedError extends Error {
  constructor(public readonly message: string) {
    super(message)
    Object.setPrototypeOf(this, NotSupportedError.prototype)
  }
}

export default NotSupportedError
