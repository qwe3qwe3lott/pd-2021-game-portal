const consolaGlobalInstance = require('consola')
const generateRandomString = require('../util/generateRandomString')
const roomsManager = require('../objects/RoomsManager')

const API = {
  version: 1.0,
  evts: {
    rename: { data: undefined },
    users: { data: undefined },
    locations: { data: undefined },
    ownerKey: { data: undefined },
    gameRunningFlag: { data: undefined },
    gamePauseFlag: { data: undefined },
    gameBriefFlag: { data: undefined },
    locationsTitles: { data: undefined },
    gameVotingFlag: { data: undefined },
    gameSpyChanceFlag: { data: undefined },
    roundId: { data: undefined },
    players: { data: undefined },
    player: { data: undefined },
    location: { data: undefined },
    timerTime: { data: undefined },
    additionalTimerTime: { data: undefined },
    voting: { data: undefined },
    winners: { data: undefined }
  },
  methods: {
    joinRoom: { msg: { roomId: '', username: '' } },
    become: { msg: { roomId: '', username: '', becomeWatcher: '' } },
    startOrResumeGame: { msg: { roomId: '', ownerKey: '' } },
    pauseGame: { msg: { roomId: '', ownerKey: '' } },
    stopGame: { msg: { roomId: '', ownerKey: '' } },
    pinpointLocation: { msg: { roomId: '', spyKey: '', username: '', location: '', roundId: '' } },
    startVotingAgainstPlayer: { mgs: { roomId: '', username: '', defendantUsername: '', roundId: '' } },
    voteAgainstPlayer: { mgs: { roomId: '', username: '', defendantUsername: '', voteFlag: '', roundId: '' } },
    setNewRoomOptions: { mgs: { roomId: '', ownerKey: '', options: '' } },
    changeUsername: { msg: { roomId: '', oldUsername: '', newUsername: '' } }
  }
}

const getNamespace = (roomId, username) => `spy/${roomId}/${username}`
const toData = value => ({ data: value })
const emit = (socket, evt, payload) => socket.emit(evt, toData(payload[evt]))

export default function Svc (socket, io) {
  return Object.freeze({
    getAPI () { return API },
    joinRoom ({ roomId, username }) {
      socket.username = username
      const room = roomsManager.getById(roomId)
      if (room === null) { return }
      // Подписываемся на события комнаты
      const userJoinedHandler = room.eventUserJoined.subscribe((sender, payload) => {
        if (payload.username !== socket.username) { return }
        emit(socket, 'locations', payload)
        emit(socket, 'gameRunningFlag', payload)
        payload.ownerKey && emit(socket, 'ownerKey', payload)
        if (payload.gameRunningFlag) {
          emit(socket, 'gamePauseFlag', payload)
          emit(socket, 'gameBriefFlag', payload)
          emit(socket, 'gameVotingFlag', payload)
          emit(socket, 'gameSpyChanceFlag', payload)
          emit(socket, 'players', payload)
          emit(socket, 'timerTime', payload)
          if (payload.gameVotingFlag) {
            emit(socket, 'additionalTimerTime', payload)
            emit(socket, 'voting', payload)
          }
          if (payload.player) {
            emit(socket, 'player', payload)
            emit(socket, 'location', payload)
            emit(socket, 'roundId', payload)
          }
        }
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': User joined')
      })
      const usersChangedHandler = room.eventUsersChanged.subscribe((sender, payload) => {
        emit(socket, 'users', payload)
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Got users list')
      })
      const userRenamedHandler = room.eventUserRenamed.subscribe((sender, payload) => {
        if (socket.tempUserKey !== payload.tempUserKey) { return }
        // Удаление временного ключа для возможности переименнования пользователя при заходе в комнату
        delete socket.tempUserKey
        consolaGlobalInstance.log(socket.username)
        socket.username = payload.username
        consolaGlobalInstance.log(socket.username)
        socket.emit('rename', toData(payload.username))
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Got new username')
      })
      const gameStartedHandler = room.eventGameStarted.subscribe((sender, payload) => {
        socket.emit('gameRunningFlag', toData(true))
        socket.emit('winners', toData([]))
        emit(socket, 'players', payload)
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Game started')
      })
      const gameOveredHandler = room.eventGameOvered.subscribe((sender, payload) => {
        socket.emit('gameRunningFlag', toData(false))
        socket.emit('timerTime', toData({ originTime: 0, currentTime: 0 }))
        emit(socket, 'winners', payload)
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Game overed')
      })
      const roundStartedHandler = room.eventRoundStarted.subscribe((sender, payload) => {
        const player = payload.players.find(player => player.username === socket.username)
        if (!player) { return }
        emit(socket, 'roundId', payload)
        socket.emit('player', toData(player))
        socket.emit('location', toData(player.isSpy ? null : payload.location))
        emit(socket, 'timerTime', payload)
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Round started')
      })
      const roundOveredHandler = room.eventRoundOvered.subscribe((sender, payload) => {
        emit(socket, 'players', payload)
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Round overed')
      })
      const gamePausedHandler = room.eventGamePaused.subscribe((sender, payload) => {
        socket.emit('gamePauseFlag', toData(true))
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Game paused')
      })
      const gameResumedHandler = room.eventGameResumed.subscribe((sender, payload) => {
        socket.emit('gamePauseFlag', toData(false))
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Game resumed')
      })
      const briefStartedHandler = room.eventBriefStarted.subscribe((sender, payload) => {
        socket.emit('gameBriefFlag', toData(true))
        emit(socket, 'timerTime', payload)
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Brief started')
      })
      const briefOveredHandler = room.eventBriefOvered.subscribe((sender, payload) => {
        socket.emit('gameBriefFlag', toData(false))
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Brief overed')
      })
      const votingStartedHandler = room.eventVotingStarted.subscribe((sender, payload) => {
        socket.emit('gameVotingFlag', toData(true))
        socket.emit('additionalTimerTime', toData(payload.timerTime))
        emit(socket, 'voting', payload)
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Voting started')
      })
      const votingOveredHandler = room.eventVotingOvered.subscribe((sender, payload) => {
        socket.emit('gameVotingFlag', toData(false))
        emit(socket, 'timerTime', payload)
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Voting overed')
      })
      const playerSpentVoteHandler = room.eventPlayerSpentVote.subscribe((sender, payload) => {
        if (payload.player.username !== socket.username) { return }
        emit(socket, 'player', payload)
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Player spent vote')
      })
      const spyChanceStartedHandler = room.eventSpyChanceStarted.subscribe((sender, payload) => {
        socket.emit('gameSpyChanceFlag', toData(true))
        emit(socket, 'additionalTimerTime', payload)
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': SpyChance started')
      })
      const spyChanceOveredHandler = room.eventSpyChanceOvered.subscribe((sender, payload) => {
        socket.emit('gameSpyChanceFlag', toData(false))
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': SpyChance overed')
      })
      const locationWasNamedHandler = room.eventLocationWasNamed.subscribe((sender, payload) => {
        socket.emit('locationsTitles', toData(payload))
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': location was named')
      })
      // Добавляем пользователя в комнату
      // В комнату может войти пользователь с уже задействавонным в комнате ником
      // Поэтому создаём временный ключ для идетнификации сокета пользователя, которого возможно нужно будет переименновать
      // После завершения входа нужно удалить ключ
      socket.tempUserKey = generateRandomString(6)
      room.addUser(username, socket.tempUserKey)
      // Подписываем пользователя на событие отключения
      socket.once('disconnect', () => {
        consolaGlobalInstance.log(getNamespace(roomId, socket.username), ': User disconnected')
        consolaGlobalInstance.log(socket.username)
        room.removeUser(socket.username)
        room.eventUserJoined.describe(userJoinedHandler)
        room.eventUsersChanged.describe(usersChangedHandler)
        room.eventUserRenamed.describe(userRenamedHandler)
        room.eventGameStarted.describe(gameStartedHandler)
        room.eventGameOvered.describe(gameOveredHandler)
        room.eventRoundStarted.describe(roundStartedHandler)
        room.eventRoundOvered.describe(roundOveredHandler)
        room.eventGamePaused.describe(gamePausedHandler)
        room.eventGameResumed.describe(gameResumedHandler)
        room.eventBriefStarted.describe(briefStartedHandler)
        room.eventBriefOvered.describe(briefOveredHandler)
        room.eventVotingStarted.describe(votingStartedHandler)
        room.eventVotingOvered.describe(votingOveredHandler)
        room.eventPlayerSpentVote.describe(playerSpentVoteHandler)
        room.eventSpyChanceStarted.describe(spyChanceStartedHandler)
        room.eventSpyChanceOvered.describe(spyChanceOveredHandler)
        room.eventLocationWasNamed.describe(locationWasNamedHandler)
        socket.leave(getNamespace(roomId, socket.username))
      })
    },
    // Переназначение роли пользователя между "игрок" и "зритель"
    become ({ roomId, username, becomeWatcher }) {
      const room = roomsManager.getById(roomId)
      if (!room || room.isRunning) { return }
      becomeWatcher ? room.makeWatcher(username) : room.makePlayer(username)
    },
    startOrResumeGame ({ roomId, ownerKey }) {
      const room = roomsManager.getById(roomId)
      if (!room) { return }
      if (room.isRunning) { room.resume(ownerKey) } else { room.startGame(ownerKey) }
    },
    pauseGame ({ roomId, ownerKey }) {
      const room = roomsManager.getById(roomId)
      if (!room || !room.isRunning) { return }
      room.pause(ownerKey)
    },
    stopGame ({ roomId, ownerKey }) {
      const room = roomsManager.getById(roomId)
      if (!room || !room.isRunning) { return }
      room.stop(ownerKey)
    },
    pinpointLocation ({ roomId, spyKey, username, location, roundId }) {
      const room = roomsManager.getById(roomId)
      if (!room || !room.isRunning) { return }
      room.pinpointLocation({ spyKey, username, location, roundId })
    },
    startVotingAgainstPlayer ({ roomId, username, defendantUsername, roundId }) {
      const room = roomsManager.getById(roomId)
      if (!room || !room.isRunning) { return }
      room.startVotingAgainstPlayer({ accuserUsername: username, defendantUsername, roundId })
    },
    voteAgainstPlayer ({ roomId, username, defendantUsername, voteFlag, roundId }) {
      const room = roomsManager.getById(roomId)
      if (!room || !room.isRunning) { return }
      room.voteAgainstPlayer({ username, defendantUsername, voteFlag, roundId })
    },
    setNewRoomOptions ({ roomId, ownerKey, options }) {
      const room = roomsManager.getById(roomId)
      if (!room || room.isRunning) { return }
      room.setNewOptions({ ownerKey, options })
    },
    changeUsername ({ roomId, oldUsername, newUsername }) {
      if (oldUsername === newUsername) { return }
      const room = roomsManager.getById(roomId)
      if (!room || room.isRunning) { return }
      socket.tempUserKey = generateRandomString(6)
      room.changeUsername(oldUsername, newUsername, socket.tempUserKey)
    }
  })
}
