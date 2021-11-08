const MyEvent = require('../MyEvent')
const Util = require('../Util')
module.exports = class SpyRoom {
  static #ADDITIONAL_USERNAME_CHAR = ')'
  static #OWNER_KEY_LENGTH = 6
  static #SPY_KEY_LENGTH = 6
  // На время тестов изменено с 3 на 1
  static #MIN_PLAYERS_COUNT = 1
  static #MAX_SECONDS_ON_PAUSE = 60 * 60

  #users; get users () { return this.#users }
  #id; get id () { return this.#id }
  #owner; get owner () { return this.#owner }
  #ownerKey
  #isRunning; get isRunning () { return this.#isRunning }
  #isOnPause; get isOnPause () { return this.#isOnPause }
  #isOnBrief
  #isOnVoting
  #isOnSpyChance
  #locations; get locations () { return this.#locations }
  #options
  #state
  #eventUserJoined; get eventUserJoined () { return this.#eventUserJoined }
  #eventUsersChanged; get eventUsersChanged () { return this.#eventUsersChanged }
  #eventUserRenamed; get eventUserRenamed () { return this.#eventUserRenamed }
  #eventGameStarted; get eventGameStarted () { return this.#eventGameStarted }
  #eventGameOvered; get eventGameOvered () { return this.#eventGameOvered }
  #eventRoundStarted; get eventRoundStarted () { return this.#eventRoundStarted }
  #eventRoundOvered; get eventRoundOvered () { return this.#eventRoundOvered }
  #eventBriefStarted; get eventBriefStarted () { return this.#eventBriefStarted }
  #eventBriefOvered; get eventBriefOvered () { return this.#eventBriefOvered }
  #eventVotingStarted; get eventVotingStarted () { return this.#eventVotingStarted }
  #eventVotingOvered; get eventVotingOvered () { return this.#eventVotingOvered }
  #eventGamePaused; get eventGamePaused () { return this.#eventGamePaused }
  #eventGameResumed; get eventGameResumed () { return this.#eventGameResumed }
  #eventPlayerSpentVote; get eventPlayerSpentVote () { return this.#eventPlayerSpentVote }
  #resolve
  #intervalId
  #accumTimeOnPause

  constructor (id, owner, options, locations) {
    this.#id = id
    this.#owner = owner
    this.#ownerKey = Util.generateRandomString(SpyRoom.#OWNER_KEY_LENGTH)
    this.#users = []
    this.#isRunning = false
    this.#isOnPause = false
    this.#isOnBrief = false
    this.#isOnVoting = false
    this.#isOnSpyChance = false
    this.setOptions(options)
    this.#locations = locations ?? [{
      title: 'void',
      url: null,
      roles: ['void']
    }]
    this.#state = {
      roundId: 0,
      lastStartMoment: Date.now(),
      location: {},
      players: [],
      roundTime: 0,
      votingTime: 0,
      briefTime: 0,
      spyChanceTime: 0,
      voting: {
        defendantUsername: null,
        accuserUsername: null,
        votes: []
      }
    }

    // TODO: избавиться от ссылок перед удалением комнаты
    this.#eventUserJoined = new MyEvent(this)
    this.#eventUsersChanged = new MyEvent(this)
    this.#eventUserRenamed = new MyEvent(this)
    this.#eventGameStarted = new MyEvent(this)
    this.#eventGameOvered = new MyEvent(this)
    this.#eventRoundStarted = new MyEvent(this)
    this.#eventRoundOvered = new MyEvent(this)
    this.#eventBriefStarted = new MyEvent(this)
    this.#eventBriefOvered = new MyEvent(this)
    this.#eventVotingStarted = new MyEvent(this)
    this.#eventVotingOvered = new MyEvent(this)
    this.#eventGamePaused = new MyEvent(this)
    this.#eventGameResumed = new MyEvent(this)
    this.#eventPlayerSpentVote = new MyEvent(this)

    this.#resolve = null
    this.#intervalId = null
  }

  setOptions (options) {
    this.#options = {
      spiesCount: options.spiesCount ?? 1,
      spyWinPoints: options.spyWinPoints ?? 4,
      spyTimeoutPoints: options.spyTimeoutPoints ?? 2,
      playerWinPoints: options.playerWinPoints ?? 1,
      playerBonusPoints: options.playerBonusPoints ?? 2,
      playerTimeoutPoints: options.playerTimeoutPoints ?? 0,
      winScore: options.winScore ?? 10,
      roundTime: options.roundTime ?? 60,
      votingTime: options.votingTime ?? 60,
      briefTime: options.briefTime ?? 5,
      spyChanceTime: options.spiesCount ?? 10
    }
  }

  // Добавление пользователя в массив пользователей с последующим вызовом событий для оповещения пользователей в комнате
  addUser (username, tempUserKey) {
    // Переименнование пользователя при совпадении ников
    if (this.#users.some(user => user.username === username)) {
      while (this.#users.some(user => user.username === username)) {
        username += SpyRoom.#ADDITIONAL_USERNAME_CHAR
      }
      this.#eventUserRenamed.notify({ tempUserKey, username })
    }
    const isOwner = (username === this.#owner)
    this.#users.push({
      username,
      isWatcher: !this.#isRunning || !(this.#state.players.some(player => player.username === username)),
      isOwner
    })
    this.#eventUsersChanged.notify({ users: this.#users })
    // Формирование пакета данных зашедшему в комнату пользователю в зависимости от состояния игры
    const payload = {
      locations: this.#locations,
      gameRunningFlag: this.#isRunning
    }
    if (isOwner) { payload.ownerKey = this.#ownerKey }
    if (this.#isRunning) {
      payload.gamePauseFlag = this.#isOnPause
      payload.gameBriefFlag = this.#isOnBrief
      payload.gameVotingFlag = this.#isOnVoting
      payload.gameSpyChanceFlag = this.#isOnSpyChance
      payload.players = this.#state.players.map(player => ({
        username: player.username,
        isOwner: player.isOwner,
        score: player.score
      }))
      payload.timerTime = {
        originTime: this.#isOnBrief ? this.#options.briefTime : this.#options.roundTime,
        currentTime: this.#isOnBrief ? this.#state.briefTime : this.#state.roundTime
      }
      if (this.#isOnVoting) {
        payload.additionalTimerTime = {
          originTime: this.#options.votingTime,
          currentTime: this.#state.votingTime
        }
        payload.voting = {
          defendantUsername: this.#state.voting.defendantUsername,
          accuserUsername: this.#state.voting.accuserUsername
        }
      }
      const player = this.#state.players.find(player => player.username === username)
      if (player) {
        payload.player = player
        payload.location = (player.isSpy ? null : this.#state.location)
      }
    }
    this.#eventUserJoined.notify(payload)
  }

  removeUser (username) {
    const userId = this.#users.findIndex(user => user.username === username)
    if (userId === -1) { return }
    this.#users.splice(userId, 1)
    this.#eventUsersChanged.notify({ users: this.#users })
  }

  makeWatcher (username) { this.#makeUser(username, true) }
  makePlayer (username) { this.#makeUser(username, false) }
  #makeUser = (username, toMakeWatcher) => {
    const user = this.#users.find(user => user.username === username)
    if (!user) { return }
    user.isWatcher = toMakeWatcher
    this.#eventUsersChanged.notify({ users: this.#users })
  }

  async startGame (ownerKey) {
    if (ownerKey !== this.#ownerKey || this.#isRunning) { return }
    if (this.#playersCount() < SpyRoom.#MIN_PLAYERS_COUNT) { return }
    this.#isRunning = true
    this.#isOnPause = this.#isOnVoting = this.#isOnBrief = this.#isOnSpyChance = false
    this.#state.lastStartMoment = Date.now()
    // Все игроки из массива пользователей вносятся в список игроков в состояние игры
    // Это позволяет сохранять информацию об игроке, даже если он отключился во время игры
    // До завершения игры перечень игроков не меняется
    this.#state.players.length = 0
    for (const player of this.#users.filter(user => !user.isWatcher)) {
      this.#state.players.push({
        username: player.username,
        isOwner: player.isOwner,
        score: 0
      })
    }
    this.#eventGameStarted.notify({ players: this.#state.players })
    // Цикл выполняется до тек пор, пока один из игроков не наберёт нужное количество очков
    // Каждая итерация цикла знаменует одни раунд партии
    this.#state.roundId = 0
    while (!this.#victoryCondition()) {
      // Случайный выбор локации
      this.#state.location = this.#locations[Util.getRandomArrayIndex(this.#locations.length)]
      // Случайное распределение ролей между игроками
      if (this.#state.players.length < this.#options.spiesCount) {
        this.#options.spiesCount = this.#state.players.length
      }
      this.#state.players.forEach((player) => { player.isSpy = false })
      do { this.#state.players[Util.getRandomArrayIndex(this.#state.players.length)].isSpy = true }
      while (this.#state.players.filter(players => players.isSpy).length < this.#options.spiesCount)
      for (const player of this.#state.players) {
        player.votes = this.#state.players.filter(p => p.username !== player.username).map(player => player.username)
        player.role = player.isSpy ? null : this.#state.location.roles[Util.getRandomArrayIndex(this.#state.location.roles.length)]
        player.spyKey = player.isSpy ? Util.generateRandomString(SpyRoom.#SPY_KEY_LENGTH) : null
      }
      this.#eventRoundStarted.notify({
        roundId: this.#state.roundId,
        players: this.#state.players,
        location: this.#state.location,
        timerTime: { originTime: this.#options.roundTime, currentTime: this.#options.roundTime }
      })
      // Запуск таймера времени раунда
      this.#state.roundTime = this.#options.roundTime
      let res = {}
      while (this.#state.roundTime > 0) {
        res = await new Promise((resolve) => {
          this.#resolve = resolve
          this.#intervalId = setInterval(() => {
            if (!this.#isOnPause) {
              if (this.#state.roundTime-- <= 0 && this.#resolve instanceof Function) {
                this.#resolveTimer({ isTimeout: true })
              }
            } else { this.#waitOnPause() }
          }, 1000)
        })
        if (res.toStopGame || res.locationWasNamed) { break }
        if (res.toStartVoting) {
          this.#state.votingTime = this.#options.votingTime
          this.#state.voting.defendantUsername = res.defendantUsername
          this.#state.voting.accuserUsername = res.accuserUsername
          this.#state.voting.votes = [res.accuserUsername]
          this.#isOnVoting = true
          this.#eventVotingStarted.notify({
            timerTime: { originTime: this.#options.votingTime, currentTime: this.#options.votingTime },
            voting: { defendantUsername: res.defendantUsername, accuserUsername: res.accuserUsername }
          })
          res = await new Promise((resolve) => {
            this.#resolve = resolve
            this.#intervalId = setInterval(() => {
              if (!this.#isOnPause) {
                if (this.#state.votingTime-- <= 0 && this.#resolve instanceof Function) {
                  this.#resolveTimer({ isTimeout: true })
                }
              } else { this.#waitOnPause() }
            }, 1000)
          })
          // Если против игрока проголосовали все другие игроки
          if (res.toCondemn) {
            // Проверяем был ли обвиняемый шпионом
            const spyLose = this.#state.players.find(player => player.username === this.#state.voting.defendantUsername).isSpy
            // По результату голосования начисляем очки игрокам
            if (spyLose) {
              this.#state.players.filter(player => player.username !== this.#state.voting.defendantUsername)
                .forEach((player) => { player.score += player.username === this.#state.voting.accuserUsername ? this.#options.playerWinPoints + this.#options.playerBonusPoints : this.#options.playerWinPoints })
            } else {
              this.#state.players.filter(player => player.isSpy).forEach((player) => { player.score += this.#options.spyWinPoints })
            }
            // Для выхода из цикла ПОСЛЕ данной итерации
            this.#state.roundTime = 0
          }
          this.#state.voting.defendantUsername = null
          this.#state.voting.accuserUsername = null
          this.#state.voting.votes.length = 0
          this.#isOnVoting = false
          this.#eventVotingOvered.notify({ timerTime: { originTime: this.#options.roundTime, currentTime: this.#state.roundTime } })
          if (res.toStopGame) { break }
        }
      }
      this.#state.roundId++
      // Если игра была принудительно остановлена
      if (res.toStopGame) { break }
      // Если раунд закончился по истечении времени
      if (res.isTimeout) {
        this.#state.players.forEach((player) => { player.score += player.isSpy ? this.#options.spyTimeoutPoints : this.#options.playerTimeoutPoints })
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
      this.#eventBriefStarted.notify({ timerTime: { originTime: this.#options.briefTime, currentTime: this.#options.briefTime } })
      // Запуск таймера времени перерыва между раундами
      this.#state.briefTime = this.#options.briefTime
      res = await new Promise((resolve) => {
        this.#resolve = resolve
        this.#intervalId = setInterval(() => {
          if (!this.#isOnPause) {
            if (this.#state.briefTime-- <= 0 && this.#resolve instanceof Function) {
              this.#resolveTimer({ isTimeout: true })
            }
          } else { this.#waitOnPause() }
        }, 1000)
      })
      this.#isOnBrief = false
      this.#eventBriefOvered.notify({})
      if (res.toStopGame) { break }
    }
    this.#isRunning = false
    this.#eventGameOvered.notify({ winners: this.#getWinnersUsernames() })
  }

  #resolveTimer = (payload) => {
    this.#resolve(payload)
    clearInterval(this.#intervalId)
    this.#resolve = this.#intervalId = null
  }

  #victoryCondition = () => this.#state.players.some(player => player.score >= this.#options.winScore)
  #getWinnersUsernames = () => this.#getWinners().map(winner => winner.username)
  #getWinners = () => this.#state.players.filter(player => player.score >= this.#options.winScore)

  // Указание локации шпионом во время игры
  pinpointLocation ({ spyKey, username, location, roundId }) {
    if (!this.#isRunning || this.isOnPause || this.#isOnBrief || this.#isOnVoting || !(this.#resolve instanceof Function)) { return }
    const spy = this.#state.players.find(player => player.username === username)
    if (!spy || spy.spyKey !== spyKey || roundId !== this.#state.roundId) { return }
    if (this.#state.location.title === location.title) {
      spy.score += this.#options.spyWinPoints
    } else {
      for (const player of this.#state.players) {
        if (player !== spy) { player.score += this.#options.playerWinPoints }
      }
    }
    this.#resolveTimer({ locationWasNamed: true })
  }

  startVotingAgainstPlayer ({ accuserUsername, defendantUsername, roundId }) {
    if (!this.#isRunning || this.isOnPause || this.#isOnBrief || this.#isOnVoting || this.#isOnSpyChance || !(this.#resolve instanceof Function)) { return }
    const player = this.#state.players.find(player => player.username === accuserUsername)
    if (!player || roundId !== this.#state.roundId) { return }
    const voteIndex = player.votes.findIndex(vote => vote === defendantUsername)
    if (voteIndex === -1) { return }
    player.votes.splice(voteIndex, 1)
    this.#eventPlayerSpentVote.notify({ player })
    this.#resolveTimer({ toStartVoting: true, defendantUsername, accuserUsername })
  }

  voteAgainstPlayer ({ username, defendantUsername, voteFlag, roundId }) {
    if (!this.#isRunning || this.isOnPause || this.#isOnBrief || !this.#isOnVoting || this.#isOnSpyChance || !(this.#resolve instanceof Function)) { return }
    if (this.#state.roundId !== roundId || this.#state.voting.defendantUsername !== defendantUsername || username === this.#state.voting.defendantUsername || username === this.#state.voting.accuserUsername) { return }
    if (!voteFlag) {
      this.#resolveTimer({ toCondemn: false })
      return
    }
    if (this.#state.voting.votes.includes(username)) { return }
    this.#state.voting.votes.push(username)
    if (this.#state.voting.votes.length + 1 >= this.#state.players.length) {
      this.#resolveTimer({ toCondemn: true })
    }
  }

  #waitOnPause = () => {
    if (this.#accumTimeOnPause++ > SpyRoom.#MAX_SECONDS_ON_PAUSE) {
      this.#accumTimeOnPause = 0
      this.isOnPause = false
      this.#eventGameResumed.notify({})
    }
  }

  stop (ownerKey) {
    if (ownerKey !== this.#ownerKey || !this.#isRunning) { return }
    this.#resolveTimer({ toStopGame: true })
  }

  pause (ownerKey) {
    if (ownerKey !== this.#ownerKey || !this.#isRunning) { return }
    this.#isOnPause = true
    this.#accumTimeOnPause = 0
    this.#eventGamePaused.notify({})
  }

  resume (ownerKey) {
    if (ownerKey !== this.#ownerKey || !this.#isRunning) { return }
    this.#isOnPause = false
    this.#accumTimeOnPause = 0
    this.#eventGameResumed.notify({})
  }

  #playersCount = () => this.#users.filter(user => !user.isWatcher).length

  isShouldBeDestroyed = () => this.#users.length !== 0 && this.#state.lastStartMoment - Date.now() > 86400000

  setNewOptions ({ ownerKey, options }) {
    if (ownerKey !== this.#ownerKey || this.#isRunning) { return }
    this.setOptions(options)
  }
}
