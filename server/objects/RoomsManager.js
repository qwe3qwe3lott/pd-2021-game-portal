const consolaGlobalInstance = require('consola')
const SpyRoom = require('./spy/SpyRoom')
class RoomsManager {
  static #CLEAN_INTERVAL = 60 * 30
  static #INSTANCE = null
  #rooms
  #intervalId

  constructor () {
    if (RoomsManager.#INSTANCE) { return RoomsManager.#INSTANCE }
    RoomsManager.#INSTANCE = this
    this.#rooms = []
    // Для тестов
    this.#rooms.push(new SpyRoom('test', 'qwe3qwe3', {}, undefined))
  }

  start () {
    this.#intervalId = this.#intervalId ?? setInterval(() => {
      consolaGlobalInstance.log(`Room cleaning started (${this.#rooms.length} rooms)`)
      this.#rooms = this.#rooms.filter(function filter (room) {
        if (room.isShouldBeDestroyed()) {
          room.destroy()
          return false
        } else { return true }
      })
      consolaGlobalInstance.log(`Room cleaning ended (${this.#rooms.length} rooms)`)
    }, RoomsManager.#CLEAN_INTERVAL * 1000)
  }

  getById (id) {
    return this.#rooms.find(room => room.id === id)
  }

  addRoom (room) { this.#rooms.push(room) }
}
const roomsManager = new RoomsManager()
roomsManager.start()
module.exports = roomsManager
