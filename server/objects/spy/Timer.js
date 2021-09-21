module.exports = class Timer {
  #timerId
  #reject
  #promise
  #isRunning

  constructor () {
    this.#clear()
  }

  run (delay) {
    if (this.#isRunning) {
      return this.#promise
    }
    this.#isRunning = true
    this.#promise = new Promise((resolve, reject) => {
      this.#reject = reject
      this.#timerId = setTimeout(() => {
        this.#clear()
        resolve()
      }, delay)
    })
    return this.#promise
  }

  cancel () {
    if (this.#isRunning) {
      clearTimeout(this.#timerId)
      this.#reject()
      this.#clear()
    }
  }

  #clear = () => {
    this.#timerId = null
    this.#reject = null
    this.#promise = null
    this.#isRunning = false
  }
}
