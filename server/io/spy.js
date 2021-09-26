import { resolve as pResolve } from 'path'
import consolaGlobalInstance from 'consola'
const api = require('../axios/api')
const Room = require('../models/room.js')
const SpyRoom = require('../objects/spy/Room')
const { default: Data } = require(pResolve('./server/db'))

const API = {
  version: 1.0,
  evts: {
    rename: {
      data: undefined
    },
    users: {
      data: undefined
    },
    locations: {
      data: undefined
    },
    ownerKey: {
      data: undefined
    },
    gameRunningFlag: {
      data: undefined
    },
    gamePauseFlag: {
      data: undefined
    },
    gameBriefFlag: {
      data: undefined
    },
    roundId: {
      data: undefined
    },
    players: {
      data: undefined
    },
    player: {
      data: undefined
    },
    location: {
      data: undefined
    }
  },
  methods: {
    createRoom: {
      resp: ''
    },
    joinRoom: {
      msg: {
        roomId: '',
        username: ''
      }
    },
    become: {
      msg: {
        roomId: '',
        username: '',
        becomeWatcher: ''
      }
    },
    startOrResumeGame: {
      msg: {
        roomId: '',
        ownerKey: ''
      }
    },
    pauseGame: {
      msg: {
        roomId: '',
        ownerKey: ''
      }
    },
    stopGame: {
      msg: {
        roomId: '',
        ownerKey: ''
      }
    },
    pinpointLocation: {
      msg: {
        roomId: '',
        spyKey: '',
        username: '',
        location: '',
        roundId: ''
      }
    }
  }
}

const prepareRoom = async (roomId) => {
  const res = await api.getters.getRoomOriginOptions(roomId)
  const originOptions = JSON.parse(res.data.options)
  const room = new SpyRoom(roomId, originOptions.owner, originOptions.options, originOptions.locations)
  getRooms().push(room)
  return room
}

const getNamespace = (roomId, username) => `spy/${roomId}/${username}`
const getRooms = () => Data.rooms.spy
const getRoom = roomId => Data.rooms.spy.find(room => room.id === roomId)

export default function Svc (socket, io) {
  const spySvc = Object.freeze({
    getAPI () {
      return API
    },
    async joinRoom ({ roomId, username }) {
      socket.username = username
      let room = getRoom(roomId)
      // Если комната есть в БД, но нет в ОЗУ
      if (!room && await Room.findOne({ _id: roomId }) !== null) {
        room = await prepareRoom(roomId)
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
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Game overed')
      })
      const roundStartedHandler = room.eventRoundStarted.subscribe((sender, payload) => {
        const player = payload.players.find(player => player.username === socket.username)
        if (!player) { return }
        socket.emit('roundId', { data: payload.roundId })
        socket.emit('player', { data: player })
        socket.emit('location', { data: (player.isSpy ? null : payload.location) })
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
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Brief started')
      })
      const briefOveredHandler = room.eventBriefOvered.subscribe((sender, payload) => {
        socket.emit('gameBriefFlag', { data: false })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Brief overed')
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
        socket.leave(getNamespace(roomId, socket.username))
      })
      // Подключаем сокет пользователя к персональному каналу (Возможно не понадобится более)
      socket.join(getNamespace(roomId, socket.username))
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
    }
  })
  return spySvc
}
