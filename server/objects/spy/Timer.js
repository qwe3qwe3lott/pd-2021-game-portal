const consolaGlobalInstance = require('consola')
module.exports = class Timer {
  #timerId
  #reject
  #promise
  #isRunning
  #isOnPause
  #startMoment
  #delay

  constructor () {
    this.#clear()
  }

  run (delay) {
    if (this.#isRunning) {
      return
    }
    consolaGlobalInstance.log('timer', 'run')
    this.#isRunning = true
    this.#delay = delay
    this.#startMoment = new Date().getTime()
    this.#promise = new Promise((resolve, reject) => {
      this.#reject = reject
      this.#timerId = setTimeout(() => {
        this.#clear()
        resolve()
      }, delay)
    })
    return this.#promise
  }

  stop () {
    if (this.#isRunning) {
      consolaGlobalInstance.log('timer', 'stop')
      clearTimeout(this.#timerId)
      this.#reject({
        isStopped: true
      })
      this.#clear()
    }
  }

  pause () {
    if (this.#isRunning && !this.#isOnPause) {
      consolaGlobalInstance.log('timer', 'pause')
      clearTimeout(this.#timerId)
      this.#reject({
        isStopped: false,
        time: this.#delay - (new Date().getTime() - this.#startMoment)
      })
      this.#isOnPause = true
    }
  }

  waitForResume () {
    if (this.#isRunning && this.#isOnPause) {
      consolaGlobalInstance.log('timer', 'waitForResume')
      this.#promise = new Promise((resolve, reject) => {
        this.#reject = reject
        this.#timerId = setTimeout(() => {
          this.#clear()
          resolve()
        }, 2147483647)
      })
      return this.#promise
    }
  }

  resume () {
    if (this.#isRunning && this.#isOnPause) {
      consolaGlobalInstance.log('timer', 'resume')
      clearTimeout(this.#timerId)
      this.#reject({
        isStopped: false
      })
      this.#clear()
    }
  }

  #clear = () => {
    this.#timerId = null
    this.#reject = null
    this.#promise = null
    this.#isRunning = false
    this.#isOnPause = false
    this.#startMoment = null
  }
}
