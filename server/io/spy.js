import { resolve as pResolve } from 'path'
import consolaGlobalInstance from 'consola'
const api = require('../axios/api')
const Room = require('../models/room.js')
const SpyRoom = require('../objects/spy/Room')
const { default: Data } = require(pResolve('./server/db'))
const Util = require('../objects/Util')

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
    renameUser: { msg: { roomId: '', username: '' } },
    startOrResumeGame: { msg: { roomId: '', ownerKey: '' } },
    pauseGame: { msg: { roomId: '', ownerKey: '' } },
    stopGame: { msg: { roomId: '', ownerKey: '' } },
    pinpointLocation: { msg: { roomId: '', spyKey: '', username: '', location: '', roundId: '' } },
    startVotingAgainstPlayer: { mgs: { roomId: '', username: '', defendantUsername: '', roundId: '' } },
    voteAgainstPlayer: { mgs: { roomId: '', username: '', defendantUsername: '', voteFlag: '', roundId: '' } }
  }
}

const getNamespace = (roomId, username) => `spy/${roomId}/${username}`
const getRooms = () => Data.rooms.spy
const getRoom = roomId => Data.rooms.spy.find(room => room.id === roomId)
const toData = value => ({ data: value })
const emit = (socket, evt, payload) => socket.emit(evt, toData(payload[evt]))

export default function Svc (socket, io) {
  return Object.freeze({
    getAPI () { return API },
    async joinRoom ({ roomId, username }) {
      socket.username = username
      let room = getRoom(roomId)
      // Если комната есть в БД, но нет в ОЗУ
      if (!room && await Room.findOne({ _id: roomId }) !== null) {
        const res = await api.getters.getRoomOriginOptions(roomId)
        const originOptions = JSON.parse(res.data.options)
        room = new SpyRoom(roomId, originOptions.owner, originOptions.options, originOptions.locations)
        getRooms().push(room)
      }
      // Подписываемся на события комнаты
      const userJoinedHandler = room.eventUserJoined.subscribe((sender, payload) => {
        // Удаление временного ключа для возможности переименнования пользователя при заходе в комнату
        delete socket.tempUserKey
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
        socket.username = payload.username
        emit('rename', toData(payload.username))
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
      // Добавляем пользователя в комнату
      // В комнату может войти пользователь с уже задействавонным в комнате ником
      // Поэтому создаём временный ключ для идетнификации сокета пользователя, которого возможно нужно будет переименновать
      // После завершения входа нужно удалить ключ
      socket.tempUserKey = Util.generateRandomString(6)
      room.addUser(username, socket.tempUserKey)
      // Подписываем пользователя на событие отключения
      socket.once('disconnect', () => {
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
        socket.leave(getNamespace(roomId, socket.username))
      })
    },
    // Переназначение роли пользователя между "игрок" и "зритель"
    become ({ roomId, username, becomeWatcher }) {
      const room = getRoom(roomId)
      if (!room || room.isRunning) { return }
      becomeWatcher ? room.makeWatcher(username) : room.makePlayer(username)
    },
    startOrResumeGame ({ roomId, ownerKey }) {
      const room = getRoom(roomId)
      if (!room) { return }
      if (room.isRunning) { room.resume(ownerKey) } else { room.startGame(ownerKey) }
    },
    renameUser ({ roomId, username }) {
      const room = getRoom(roomId)
      alert(username)
      console.log('222222222222222222', username)
      room.updateUser(username)
    },
    pauseGame ({ roomId, ownerKey }) {
      const room = getRoom(roomId)
      if (!room || !room.isRunning) { return }
      room.pause(ownerKey)
    },
    stopGame ({ roomId, ownerKey }) {
      const room = getRoom(roomId)
      if (!room || !room.isRunning) { return }
      room.stop(ownerKey)
    },
    pinpointLocation ({ roomId, spyKey, username, location, roundId }) {
      const room = getRoom(roomId)
      if (!room || !room.isRunning) { return }
      room.pinpointLocation({
        spyKey,
        username,
        location,
        roundId
      })
    },
    startVotingAgainstPlayer ({ roomId, username, defendantUsername, roundId }) {
      const room = getRoom(roomId)
      if (!room || !room.isRunning) { return }
      room.startVotingAgainstPlayer({
        accuserUsername: username,
        defendantUsername,
        roundId
      })
    },
    voteAgainstPlayer ({ roomId, username, defendantUsername, voteFlag, roundId }) {
      const room = getRoom(roomId)
      if (!room || !room.isRunning) { return }
      room.voteAgainstPlayer({
        username,
        defendantUsername,
        voteFlag,
        roundId
      })
    }
  })
}
