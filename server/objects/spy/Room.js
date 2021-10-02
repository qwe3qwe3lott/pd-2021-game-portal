const MyEvent = require('../MyEvent')
const Util = require('../Util')
const Timer = require('./Timer')
module.exports = class SpyRoom {
  static #additionalUsernameChar = ')'
  static #ownerKeyLength = 6
  static #spyKeyLength = 6
  static #minPlayersCount = 3

  #users
  #id
  #owner
  #ownerKey
  #isRunning
  #isOnPause
  #isOnBrief
  #locations
  #options
  #state
  #eventUsersChanged
  #eventUserRenamed
  #eventGameStarted
  #eventGameOvered
  #eventRoundStarted
  #eventRoundOvered
  #eventBriefStarted
  #eventBriefOvered
  #eventGamePaused
  #eventGameResumed
  #timer
  #stopGameFlag

  constructor (id, owner, options, locations) {
    this.#id = id
    this.#owner = owner
    this.#ownerKey = Util.generateRandomString(SpyRoom.#ownerKeyLength)
    this.#users = []
    this.#isRunning = false
    this.#isOnPause = false
    this.#isOnBrief = false
    this.#options = {
      spiesCount: options.spiesCount ?? 1,
      spyWinPoints: options.spyWinPoints ?? 4,
      spyTimeoutPoints: options.spyTimeoutPoints ?? 2,
      playerWinPoints: options.playerWinPoints ?? 1,
      playerBonusPoints: options.playerBonusPoints ?? 1,
      playerTimeoutPoints: options.playerTimeoutPoints ?? 0,
      winScore: options.winScore ?? 10,
      roundTime: options.roundTime ?? 15,
      voteTime: options.voteTime ?? 15,
      briefTime: options.briefTime ?? 5,
      spyChanceTime: options.spiesCount ?? 10
    }
    this.#locations = locations ?? {
      title: 'void',
      url: null,
      roles: ['void']
    }
    this.#state = {
      roundId: 0,
      lastStartMoment: null,
      location: {},
      players: []
    }

    this.#eventUsersChanged = new MyEvent(this)
    this.#eventUserRenamed = new MyEvent(this)
    this.#eventGameStarted = new MyEvent(this)
    this.#eventGameOvered = new MyEvent(this)
    this.#eventRoundStarted = new MyEvent(this)
    this.#eventRoundOvered = new MyEvent(this)
    this.#eventBriefStarted = new MyEvent(this)
    this.#eventBriefOvered = new MyEvent(this)
    this.#eventGamePaused = new MyEvent(this)
    this.#eventGameResumed = new MyEvent(this)

    this.#timer = new Timer()
    this.#stopGameFlag = false
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
      isWatcher: !(this.#state.players.some(player => player.username === username)),
      isOwner
    })
    this.#eventUsersChanged.notify({
      users: this.#users
    })
    if (isOwner) {
      socket.emit('ownerKey', { data: this.#ownerKey })
    }
    socket.emit('locations', { data: this.#locations })
    socket.emit('gameRunningFlag', { data: this.#isRunning })
    if (!this.#isRunning) { return }
    socket.emit('gamePauseFlag', { data: this.#isOnPause })
    socket.emit('gameBriefFlag', { data: this.#isOnBrief })
    socket.emit('roundId', { data: this.#state.roundId })
    socket.emit('players', {
      data: this.#state.players.map(player => ({
        username: player.username,
        isOwner: player.isOwner,
        score: player.score
      }))
    })
    const player = this.#state.players.find(player => player.username === username)
    if (!player) { return }
    socket.emit('player', { data: player })
    socket.emit('location', { data: (player.isSpy ? null : this.#state.location) })
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
    if (ownerKey !== this.#ownerKey || this.#isRunning) { return }
    // На время тестов изменено
    // if (this.#playersCount() < SpyRoom.#minPlayersCount) { return }
    if (this.#playersCount() < 1) { return }
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
    this.#eventGameStarted.notify({
      players: this.#state.players
    })
    // Цикл выполняется до тек пор, пока один из игроков не наберёт нужное количество очков
    // Каждая итерация цикла знаменует одни раунд партии
    this.#state.roundId = 0
    this.#stopGameFlag = false
    while (!this.#victoryCondition() && !this.#stopGameFlag) {
      // Случайный выбор локации
      this.#state.location = this.#locations[Util.getRandomArrayIndex(this.#locations.length)]
      // Случайное распределение ролей между игроками
      if (this.#state.players.length < this.#options.spiesCount) {
        this.#options.spiesCount = this.#state.players.length
      }
      this.#state.players.forEach((player) => {
        player.isSpy = false
      })
      do {
        this.#state.players[Util.getRandomArrayIndex(this.#state.players.length)].isSpy = true
      } while (this.#state.players.filter(players => players.isSpy) < this.#options.spiesCount)
      for (const player of this.#state.players) {
        player.role = player.isSpy ? null : this.#state.location.roles[Util.getRandomArrayIndex(this.#state.location.roles.length)]
        player.spyKey = player.isSpy ? Util.generateRandomString(SpyRoom.#spyKeyLength) : null
      }
      this.#eventRoundStarted.notify({
        roundId: this.#state.roundId,
        players: this.#state.players,
        location: this.#state.location,
        timerSeconds: this.#options.roundTime
      })
      // Запуск таймера времени раунда
      const isTimeout = await this.#launchTimer(this.#options.roundTime * 1000)
      this.#state.roundId++
      // Если раунд закончился по истечении времени
      if (isTimeout) {
        for (const player of this.#state.players) {
          player.score += player.isSpy ? this.#options.spyTimeoutPoints : this.#options.playerTimeoutPoints
        }
      }
      this.#eventRoundOvered.notify({
        players: this.#state.players.map(player => ({
          username: player.username,
          isOwner: player.isOwner,
          score: player.score
        }))
      })
      // Если кто-то выиграл или владелец остановил игру
      if (this.#victoryCondition() || this.#stopGameFlag) { break }
      this.#isOnBrief = true
      this.#eventBriefStarted.notify({
        timerSeconds: this.#options.briefTime
      })
      // Запуск таймера времени перерыва между раундами
      await this.#launchTimer(this.#options.briefTime * 1000)
      this.#isOnBrief = false
      this.#eventBriefOvered.notify({})
      // Если владелец остановил игру
      if (this.#stopGameFlag) { break }
    }
    this.#isRunning = false
    this.#eventGameOvered.notify({})
  }

  #victoryCondition = () => this.#state.players.some(player => player.score >= this.#options.winScore)

  // Рекурсивный таймер, в ход работы которого может вмешиваться владелец комнаты (ставить на паузу, останавливать)
  #launchTimer = async (time) => {
    if (time <= 0) { return }
    try {
      await this.#timer.run(time)
      return true
    } catch (e) {
      if (e.isStopped) {
        return
      } else {
        time = e.time
        try {
          this.#isOnPause = true
          await this.#timer.waitForResume()
          this.#isOnPause = false
        } catch (e) {
          this.#isOnPause = false
          if (e.isStopped) { return }
        }
      }
    }
    return await this.#launchTimer(time)
  }

  pinpointLocation ({ spyKey, username, location, roundId }) {
    if (!this.#isRunning) { return }
    const spy = this.#state.players.find(player => player.username === username)
    if (!spy || spy.spyKey !== spyKey || roundId !== this.#state.roundId) { return }
    if (this.#state.location.title === location.title) {
      spy.score += this.#options.spyWinPoints
    } else {
      for (const player of this.#state.players) {
        if (player.username !== spy.username) {
          player.score += this.#options.playerWinPoints
        }
      }
    }
    this.#timer.stop()
  }

  stop (ownerKey) {
    if (ownerKey !== this.#ownerKey || !this.#isRunning) { return }
    this.#stopGameFlag = true
    this.#timer.stop()
  }

  pause (ownerKey) {
    if (ownerKey !== this.#ownerKey || !this.#isRunning) { return }
    this.#timer.pause()
    this.#eventGamePaused.notify({})
  }

  resume (ownerKey) {
    if (ownerKey !== this.#ownerKey || !this.#isRunning) { return }
    this.#timer.resume()
    this.#eventGameResumed.notify({})
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
  get eventGameStarted () { return this.#eventGameStarted }
  get eventGameOvered () { return this.#eventGameOvered }
  get eventRoundStarted () { return this.#eventRoundStarted }
  get eventRoundOvered () { return this.#eventRoundOvered }
  get eventBriefStarted () { return this.#eventBriefStarted }
  get eventBriefOvered () { return this.#eventBriefOvered }
  get eventGamePaused () { return this.#eventGamePaused }
  get eventGameResumed () { return this.#eventGameResumed }
}
