import { resolve as pResolve } from 'path'
import consolaGlobalInstance from 'consola'
const api = require('../axios/api')
const Room = require('../models/room.js')
const SpyRoom = require('../objects/spy/Room')
const { default: Data } = require(pResolve('./server/db'))

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
    voting: { data: undefined }
  },
  methods: {
    joinRoom: {
      msg: { roomId: '', username: '' }
    },
    become: {
      msg: { roomId: '', username: '', becomeWatcher: '' }
    },
    startOrResumeGame: {
      msg: { roomId: '', ownerKey: '' }
    },
    pauseGame: {
      msg: { roomId: '', ownerKey: '' }
    },
    stopGame: {
      msg: { roomId: '', ownerKey: '' }
    },
    pinpointLocation: {
      msg: { roomId: '', spyKey: '', username: '', location: '', roundId: '' }
    },
    startVotingAgainstPlayer: {
      mgs: { roomId: '', username: '', defendantUsername: '', roundId: '' }
    },
    voteAgainstPlayer: {
      mgs: { roomId: '', username: '', defendantUsername: '', voteFlag: '', roundId: '' }
    }
  }
}

const getNamespace = (roomId, username) => `spy/${roomId}/${username}`
const getRooms = () => Data.rooms.spy
const getRoom = roomId => Data.rooms.spy.find(room => room.id === roomId)

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
      const usersChangedHandler = room.eventUsersChanged.subscribe((sender, payload) => {
        socket.emit('users', { data: payload.users })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Got users list')
      })
      const userRenamedHandler = room.eventUserRenamed.subscribe((sender, payload) => {
        if (socket !== payload.socket) { return }
        socket.username = payload.newUsername
        socket.leave(getNamespace(sender.id, payload.oldUsername))
        socket.join(getNamespace(sender.id, payload.newUsername))
        socket.emit('rename', { data: payload.newUsername })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Got new username')
      })
      const gameStartedHandler = room.eventGameStarted.subscribe((sender, payload) => {
        socket.emit('gameRunningFlag', { data: true })
        socket.emit('players', { data: payload.players })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Game started')
      })
      const gameOveredHandler = room.eventGameOvered.subscribe((sender, payload) => {
        socket.emit('gameRunningFlag', { data: false })
        socket.emit('timerTime', { data: { originTime: 0, currentTime: 0 } })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Game overed')
      })
      const roundStartedHandler = room.eventRoundStarted.subscribe((sender, payload) => {
        const player = payload.players.find(player => player.username === socket.username)
        if (!player) { return }
        socket.emit('roundId', { data: payload.roundId })
        socket.emit('player', { data: player })
        socket.emit('location', { data: (player.isSpy ? null : payload.location) })
        socket.emit('timerTime', { data: payload.timerTime })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Round started')
      })
      const roundOveredHandler = room.eventRoundOvered.subscribe((sender, payload) => {
        socket.emit('players', { data: payload.players })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Round overed')
      })
      const gamePausedHandler = room.eventGamePaused.subscribe((sender, payload) => {
        socket.emit('gamePauseFlag', { data: true })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Game paused')
      })
      const gameResumedHandler = room.eventGameResumed.subscribe((sender, payload) => {
        socket.emit('gamePauseFlag', { data: false })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Game resumed')
      })
      const briefStartedHandler = room.eventBriefStarted.subscribe((sender, payload) => {
        socket.emit('gameBriefFlag', { data: true })
        socket.emit('timerTime', { data: payload.timerTime })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Brief started')
      })
      const briefOveredHandler = room.eventBriefOvered.subscribe((sender, payload) => {
        socket.emit('gameBriefFlag', { data: false })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Brief overed')
      })
      const votingStartedHandler = room.eventVotingStarted.subscribe((sender, payload) => {
        socket.emit('gameVotingFlag', { data: true })
        socket.emit('additionalTimerTime', { data: payload.timerTime })
        socket.emit('voting', { data: payload.voting })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Voting started')
      })
      const votingOveredHandler = room.eventVotingOvered.subscribe((sender, payload) => {
        socket.emit('gameVotingFlag', { data: false })
        socket.emit('timerTime', { data: payload.timerTime })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Voting overed')
      })
      const playerSpentVoteHandler = room.eventPlayerSpentVote.subscribe((sender, payload) => {
        if (payload.player.username !== socket.username) { return }
        socket.emit('player', { data: payload.player })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Player spent vote')
      })
      // Добавляем пользователя в комнату
      room.addUser(username, socket)
      // Подписываем пользователя на событие отключения
      socket.once('disconnect', () => {
        room.removeUser(socket.username)
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
    become ({ roomId, username, becomeWatcher }) {
      const room = getRoom(roomId)
      if (!room || room.isRunning) { return }
      // Переназначаем роль пользователя
      if (becomeWatcher) {
        room.makeUserWatcher(username)
      } else {
        room.makeUserPlayer(username)
      }
    },
    startOrResumeGame ({ roomId, ownerKey }) {
      const room = getRoom(roomId)
      if (!room) { return }
      if (room.isRunning) {
        room.resume(ownerKey)
      } else {
        room.startGame(ownerKey)
      }
    },
    pauseGame ({ roomId, ownerKey }) {
      const room = getRoom(roomId)
      if (!room) { return }
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
