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
  #isOnPause
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
  #eventGamePaused
  #eventGameResumed
  #timer

  constructor (id, owner, options, locations) {
    this.#id = id
    this.#owner = owner
    // TODO: рандомная генерация ключа
    this.#ownerKey = '123'
    this.#users = []
    this.#isRunning = false
    this.#isOnPause = false
    this.#options = {
      spiesCount: options.spiesCount ?? 1,
      winPointsCount: options.winPointsCount ?? 5,
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
    this.#eventGamePaused = new MyEvent(this)
    this.#eventGameResumed = new MyEvent(this)

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
      return
    }
    // На время тестов изменено
    // if (this.#playersCount() < SpyRoom.#minPlayersCount) {
    if (this.#playersCount() < 1) {
      return
    }
    this.#isRunning = true
    this.#state.lastStartMoment = Date.now()
    // Все игроки из массива пользователей вносятся в список игроков в состояние игры
    // Это позволяет сохранять информацию об игроке, даже если он отключился во время игры
    // До завершения игры перечень игроков не меняется
    this.#state.players = []
    for (const player of this.#users.filter(user => !user.isWatcher)) {
      this.#state.players.push({
        username: player.username,
        isOwner: player.isOwner,
        score: 0
      })
    }
    // TODO: пользователи узнают, что игра началась
    this.#eventGameStarted.notify({
      players: this.#state.players
    })
    // Цикл выполняется до тек пор, пока один из игроков не наберёт нужное количество очков
    // Каждая итерация цикла знаменует одни раунд партии
    let roundId = 0
    while (!this.#state.players.some(player => player.score >= this.#options.winPointsCount)) {
      if (this.#state.players.length < this.#options.spiesCount) {
        this.#options.spiesCount = this.#state.players.length
      }
      // Случайный выбор локации и случайное распределение ролей между игроками
      this.#state.location = this.#locations[Math.floor(Math.random() * this.#locations.length)]
      this.#state.players.forEach((player) => {
        player.isSpy = false
      })
      do {
        this.#state.players[Math.floor(Math.random() * this.#state.players.length)].isSpy = true
      } while (this.#state.players.filter(players => players.isSpy) < this.#options.spiesCount)
      for (const player of this.#state.players) {
        if (!player.isSpy) {
          player.role = this.#state.location.roles[Math.floor(Math.random() * this.#state.location.roles.length)]
        }
      }
      this.#eventRoundStarted.notify({
        roundId,
        players: this.#state.players,
        location: this.#state.location
      })
      // Рекурсивный таймер, в ход работы которого может вмешиваться владелец комнаты (ставить на паузу, останавливать)
      await this.#launchTimer(this.#options.roundTime * 1000)

      // Тест
      for (const player of this.#state.players) {
        player.score++
      }
      //
      this.#eventRoundOvered.notify({})
      roundId++
    }
    this.#isRunning = false
    this.#eventGameOvered.notify({})
  }

  #launchTimer = async (time) => {
    if (time <= 0) { return }
    try {
      await this.#timer.run(time)
      return
    } catch (e) {
      if (e.isStopped) {
        return
      } else {
        time = e.time
        try {
          await this.#timer.waitForResume()
        } catch (e) {
          if (e.isStopped) { return }
        }
      }
    }
    await this.#launchTimer(time)
  }

  stop (ownerKey) {
    if (ownerKey !== this.#ownerKey) {
      return
    }
    if (this.#isRunning) {
      this.#timer.stop()
    }
  }

  pause (ownerKey) {
    if (ownerKey !== this.#ownerKey) {
      return
    }
    if (this.#isRunning) {
      this.#timer.pause()
      this.#eventGamePaused.notify({})
    }
  }

  resume (ownerKey) {
    if (ownerKey !== this.#ownerKey) {
      return
    }
    if (this.#isRunning) {
      this.#timer.resume()
      this.#eventGameResumed.notify({})
    }
  }

  #playersCount = () => this.#users.filter(user => !user.isWatcher).length

  get id () { return this.#id }
  get owner () { return this.#owner }
  get isRunning () { return this.#isRunning }
  get isOnPause () { return this.#isOnPause }
  get users () { return this.#users }
  get locations () { return this.#locations }
  get eventUsersChanged () { return this.#eventUsersChanged }
  get eventUserRenamed () { return this.#eventUserRenamed }
  get eventOwnerJoined () { return this.#eventOwnerJoined }
  get eventGameStarted () { return this.#eventGameStarted }
  get eventGameOvered () { return this.#eventGameOvered }
  get eventRoundStarted () { return this.#eventRoundStarted }
  get eventRoundOvered () { return this.#eventRoundOvered }
  get eventGamePaused () { return this.#eventGamePaused }
  get eventGameResumed () { return this.#eventGameResumed }
}
