export default class fileWriterSync {
  constructor(writer, path) {
    this.writer = writer
    this.path = path
    this._stack = Promise.resolve()
  }

  get stack() {
    return this._stack
  }

  set stack(promise) {
    this._stack = promise
  }

  write(content) {
    this.stack = this.stack.then(()=> {
      const promise = new Promise(resolve => (this.writer.onwriteend = resolve))
      this.writer.write(content)
      return promise
    })

    return this.stack
  }

  async seek(position) {
    await this.stack
    this.writer.seek(position)
  }

  truncate(length) {
    this.stack = this.stack.then(()=> {
      const promise = new Promise(resolve => (this.writer.onwriteend = resolve))
      this.writer.truncate(length)
      return promise
    })

    return this.stack
  }
}
