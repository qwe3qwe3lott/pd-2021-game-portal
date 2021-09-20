module.exports = class SpyRoom {
  static #additionalUsernameChar = ')'
  #users
  #id
  #owner
  #isRunning
  #locations
  #options
  #state

  constructor (id, owner, options, locations) {
    this.#id = id
    this.#owner = owner
    this.#users = []
    this.#isRunning = false
    this.#options = {
      spiesCount: options.spiesCount ?? 1,
      roundTime: options.roundTime ?? 400,
      voteTime: options.voteTime ?? 15,
      briefTime: options.spiesCount ?? 10,
      spyChanceTime: options.spiesCount ?? 10
    }
    this.#locations = locations ?? {
      title: 'void',
      url: null,
      roles: ['void']
    }
    this.#state = {
      startMoment: null,
      isRunning: false,
      players: []
    }
    this.#makeUser = function (username, makeWatcher) {
      this.#users.forEach(function (user, index) {
        if (this[index].username === username) {
          this[index].isWatcher = makeWatcher
        }
      }, this.#users)
    }
  }

  addUser (username) {
    let wasRenamed = false
    if (this.#users.some(user => user.username === username)) {
      username += SpyRoom.#additionalUsernameChar
      wasRenamed = true
    }
    this.#users.push({
      username,
      isWatcher: true,
      isOwner: (username === this.#owner)
    })
    return {
      username,
      wasRenamed
    }
  }

  removeUser (username) {
    const userId = this.#users.findIndex(user => user.username === username)
    if (userId !== -1) {
      this.#users.splice(userId, 1)
    }
    return {
      wasRemoved: (userId !== -1)
    }
  }

  makeUserWatcher (username) {
    this.#makeUser(username, true)
  }

  makeUserPlayer (username) {
    this.#makeUser(username, false)
  }

  #makeUser

  get id () {
    return this.#id
  }

  get users () {
    return this.#users
  }

  get locations () {
    return this.#locations
  }
}
