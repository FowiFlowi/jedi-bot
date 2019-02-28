class CustomError extends Error {
  constructor(message) {
    super()
    this.message = message
    this.timestamp = new Date().toISOString()
  }
}

module.exports = CustomError
