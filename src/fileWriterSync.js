export default class fileWriterSync {
  constructor(writer, path) {
    this.writer = writer
    this.path = path
  }

  get stack() {
    return this._stack || Promise.resolve()
  }

  set stack(promise) {
    this._stack = promise
  }

  write(content) {
    this.stack = this.stack.then(()=> {
      this.stack = this.stack.then(()=> {
        const promise = new Promise(resolve => (this.writer.onwriteend = resolve))
        this.writer.write(content)
        return promise
      })
    })

    return this.stack
  }

  async seek(position) {
    await this.stack
    this.writer.seek(position)
  }

  truncate(length) {
    this.stack = this.stack.then(()=> {
      this.stack = this.stack.then(()=> {
        const promise = new Promise(resolve => (this.writer.onwriteend = resolve))
        this.writer.truncate(length)
        return promise
      })
    })

    return this.stack
  }

  blobToString(blob) {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsText(blob)
    })
  }
}
