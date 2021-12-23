const consolaGlobalInstance = require('consola')
const SpyRoom = require('./spy/SpyRoom')
class RoomsManager {
  static #CLEAN_INTERVAL = 60 * 30
  #rooms
  #intervalId

  constructor () {
    if (RoomsManager._instance) { return RoomsManager._instance }
    RoomsManager._instance = this
    this.#rooms = []
    // Для тестов
    this.#rooms.push(new SpyRoom('test', 'qwe3qwe3', {}, undefined))
  }

  start () {
    this.#intervalId = this.#intervalId ?? setInterval(() => {
      consolaGlobalInstance.log(`Room cleaning started (${this.#rooms.length} rooms)`)
      this.#rooms = this.#rooms.filter(room => !(room.isShouldBeDestroyed() && room.destroy()))
      consolaGlobalInstance.log(`Room cleaning ended (${this.#rooms.length} rooms)`)
    }, RoomsManager.#CLEAN_INTERVAL * 1000)
  }

  getById (id) { return this.#rooms.find(room => room.id === id) }

  addRoom (room) { this.#rooms.push(room) }
}

module.exports = new RoomsManager()
