const MyEvent = require('../MyEvent')
const Timer = require('./Timer')
module.exports = class SpyRoom {
  static #additionalUsernameChar = ')'
  static #minPlayersCount = 3

  #users
  #id
  #owner
  #ownerKey
  #isRunning
  #locations
  #options
  #state
  #eventUsersChanged
  #eventUserRenamed
  #eventOwnerJoined
  #eventGameStarted
  #eventGameOvered
  #eventRoundStarted
  #eventRoundOvered
  #timer

  constructor (id, owner, options, locations) {
    this.#id = id
    this.#owner = owner
    // TODO: рандомная генерация ключа
    this.#ownerKey = '123'
    this.#users = []
    this.#isRunning = false
    this.#options = {
      spiesCount: options.spiesCount ?? 1,
      roundTime: options.roundTime ?? 5,
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
      lastStartMoment: null,
      location: {},
      players: []
    }

    this.#eventUsersChanged = new MyEvent(this)
    this.#eventUserRenamed = new MyEvent(this)
    this.#eventOwnerJoined = new MyEvent(this)
    this.#eventGameStarted = new MyEvent(this)
    this.#eventGameOvered = new MyEvent(this)
    this.#eventRoundStarted = new MyEvent(this)
    this.#eventRoundOvered = new MyEvent(this)

    this.#timer = new Timer()
  }

  addUser (username, socket) {
    if (this.#users.some(user => user.username === username)) {
      const oldUsername = username
      while (this.#users.some(user => user.username === username)) {
        username += SpyRoom.#additionalUsernameChar
      }
      this.#eventUserRenamed.notify({
        socket,
        oldUsername,
        newUsername: username
      })
    }
    const isOwner = (username === this.#owner)
    this.#users.push({
      username,
      isWatcher: true,
      isOwner
    })
    this.#eventUsersChanged.notify({
      users: this.#users
    })
    if (isOwner) {
      this.#eventOwnerJoined.notify({
        ownerKey: this.#ownerKey
      })
    }
  }

  removeUser (username) {
    const userId = this.#users.findIndex(user => user.username === username)
    if (userId !== -1) {
      this.#users.splice(userId, 1)
      this.#eventUsersChanged.notify({
        users: this.#users
      })
    }
  }

  makeUserWatcher (username) {
    this.#makeUser(username, true)
  }

  makeUserPlayer (username) {
    this.#makeUser(username, false)
  }

  #makeUser = (username, makeWatcher) => {
    for (let i = 0; i < this.#users.length; i++) {
      if (this.#users[i].username === username) {
        this.#users[i].isWatcher = makeWatcher
        this.#eventUsersChanged.notify({
          users: this.#users
        })
      }
    }
  }

  async startGame (ownerKey) {
    if (ownerKey !== this.#ownerKey) {
      return
    }
    if (this.#isRunning) {
      // Удалить в итоге
      /* this.#timer.cancel()
      this.#isRunning = false
      this.#eventRoundOvered.notify({})
      this.#eventGameOvered.notify({}) */
      return
    }
    // На время тестов отключено
    /* if (this.#playersCount < SpyRoom.#minPlayersCount) {
      return
    } */
    this.#isRunning = true
    this.#state.lastStartMoment = Date.now()
    this.#eventGameStarted.notify({})
    this.#eventRoundStarted.notify({})
    await this.#timer.run(this.#options.roundTime * 1000)
      .catch(() => {})
    this.#isRunning = false
    this.#eventRoundOvered.notify({})
    this.#eventGameOvered.notify({})
  }

  #playersCount = () => this.#users.filter(user => !user.isWatcher).length

  get id () { return this.#id }
  get owner () { return this.#owner }
  get isRunning () { return this.#isRunning }
  get users () { return this.#users }
  get locations () { return this.#locations }
  get eventUsersChanged () { return this.#eventUsersChanged }
  get eventUserRenamed () { return this.#eventUserRenamed }
  get eventOwnerJoined () { return this.#eventOwnerJoined }
  get eventGameStarted () { return this.#eventGameStarted }
  get eventGameOvered () { return this.#eventGameOvered }
  get eventRoundStarted () { return this.#eventRoundStarted }
  get eventRoundOvered () { return this.#eventRoundOvered }
}
