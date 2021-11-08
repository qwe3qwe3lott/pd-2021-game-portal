module.exports = class RoomsController {
  #rooms
  #timeInterval

  constructor (rooms, timeInterval = 60) {
    this.#rooms = rooms
    this.#timeInterval = timeInterval
  }

  run () {
    setInterval(() => {
      for (const [game, rooms] of Object.entries(this.#rooms)) {
        for (const room of rooms) {
          if (room.isShouldBeDestroyed()) {
            // Удалить из бд и RAM
          }
        }
      }
    }, this.#timeInterval * 1000)
  }
}
