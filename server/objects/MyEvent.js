module.exports = class MyEvent {
  #sender
  #listeners

  constructor (sender) {
    this.#sender = sender
    this.#listeners = []
  }

  subscribe (listener) {
    this.#listeners.push(listener)
  }

  describe (listener) {
    const listenerId = this.#listeners.findIndex(item => item === listener)
    if (listenerId !== -1) {
      this.#listeners.splice(listenerId, 1)
    }
  }

  notify (payload) {
    for (const listener of this.#listeners) {
      listener(this.#sender, payload)
    }
  }

  clear () {
    this.#listeners = []
  }
}
