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
  #resolve
  #intervalId

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
      roundTime: options.roundTime ?? 20,
      voteTime: options.voteTime ?? 15,
      briefTime: options.briefTime ?? 5,
      spyChanceTime: options.spiesCount ?? 10
    }
    this.#locations = locations ?? [{
      title: 'void',
      url: null,
      roles: ['void']
    }]
    this.#state = {
      roundId: 0,
      lastStartMoment: null,
      location: {},
      players: [],
      roundTime: 0,
      voteTime: 0,
      briefTime: 0,
      spyChanceTime: 0
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

    this.#resolve = null
    this.#intervalId = null
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
    socket.emit('timerTime', {
      data: {
        originTime: this.#isOnBrief ? this.#options.briefTime : this.#options.roundTime,
        currentTime: this.#isOnBrief ? this.#state.briefTime : this.#state.roundTime
      }
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
      // TODO: Проверять, изменил ли владелец игры настройки
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
        player.votes = this.#state.players.filter(p => p.username !== player.username).map(player => player.username)
        player.role = player.isSpy ? null : this.#state.location.roles[Util.getRandomArrayIndex(this.#state.location.roles.length)]
        player.spyKey = player.isSpy ? Util.generateRandomString(SpyRoom.#spyKeyLength) : null
      }
      this.#eventRoundStarted.notify({
        roundId: this.#state.roundId,
        players: this.#state.players,
        location: this.#state.location,
        timerTime: {
          originTime: this.#options.roundTime,
          currentTime: this.#options.roundTime
        }
      })
      // Запуск таймера времени раунда
      this.#state.roundTime = this.#options.roundTime
      this.#state.voteTime = this.#options.voteTime
      this.#state.spyChanceTime = this.#options.spyChanceTime
      // TODO: понять, нужен ли тут ещё один while для state.round > 0, чтобы обрабатывать голосование
      let res = await new Promise((resolve) => {
        this.#resolve = resolve
        this.#intervalId = setInterval(() => {
          if (!this.#isOnPause) {
            if (this.#state.roundTime-- <= 0) {
              this.#resolveTimer({ isTimeout: true })
            }
          }
        }, 1000)
      })
      this.#state.roundId++
      // Если игра была принудительно остановлена
      if (res.toStopGame) { break }
      // Если раунд закончился по истечении времени
      if (res.isTimeout) {
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
      // Если кто-то выиграл
      if (this.#victoryCondition()) { break }
      this.#isOnBrief = true
      this.#eventBriefStarted.notify({
        timerTime: {
          originTime: this.#options.briefTime,
          currentTime: this.#options.briefTime
        }
      })
      // Запуск таймера времени перерыва между раундами
      this.#state.briefTime = this.#options.briefTime
      res = await new Promise((resolve) => {
        this.#resolve = resolve
        this.#intervalId = setInterval(() => {
          if (!this.#isOnPause) {
            if (this.#state.briefTime-- <= 0) {
              this.#resolveTimer({ isTimeout: true })
            }
          }
        }, 1000)
      })
      this.#isOnBrief = false
      this.#eventBriefOvered.notify({})
      if (res.toStopGame) { break }
    }
    this.#isRunning = false
    this.#eventGameOvered.notify({})
  }

  #resolveTimer = (payload) => {
    this.#resolve(payload)
    clearInterval(this.#intervalId)
    this.#resolve = this.#intervalId = null
  }

  #victoryCondition = () => this.#state.players.some(player => player.score >= this.#options.winScore)

  pinpointLocation ({ spyKey, username, location, roundId }) {
    if (!this.#isRunning || this.isOnPause || this.#isOnBrief) { return }
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
    this.#resolveTimer({})
  }

  stop (ownerKey) {
    if (ownerKey !== this.#ownerKey || !this.#isRunning) { return }
    this.#stopGameFlag = true
    this.#resolveTimer({ toStopGame: true })
  }

  pause (ownerKey) {
    if (ownerKey !== this.#ownerKey || !this.#isRunning) { return }
    this.#isOnPause = true
    // this.#timer.pause()
    this.#eventGamePaused.notify({})
  }

  resume (ownerKey) {
    if (ownerKey !== this.#ownerKey || !this.#isRunning) { return }
    this.#isOnPause = false
    // this.#timer.resume()
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
