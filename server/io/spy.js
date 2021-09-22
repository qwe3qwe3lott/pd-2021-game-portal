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
      data: ''
    },
    users: {
      data: [{}]
    },
    locations: {
      data: [{}]
    },
    ownerKey: {
      data: ''
    },
    gameStart: {
      data: {}
    },
    gameOver: {
      data: {}
    },
    roundStart: {
      data: {}
    },
    roundOver: {
      data: {}
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
    startGame: {
      msg: {
        roomId: '',
        ownerKey: ''
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
        if (socket !== payload.socket) {
          return
        }
        socket.username = payload.newUsername
        socket.leave(getNamespace(sender.id, payload.oldUsername))
        socket.join(getNamespace(sender.id, payload.newUsername))
        socket.emit('rename', { data: payload.newUsername })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Got new username')
      })
      const ownerJoinedHandler = room.eventOwnerJoined.subscribe((sender, payload) => {
        if (socket.username !== sender.owner) {
          return
        }
        socket.emit('ownerKey', { data: payload.ownerKey })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), ': Got owner key')
      })
      const gameStartedHandler = room.eventGameStarted.subscribe((sender, payload) => {
        socket.emit('gameStart', { data: {} })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), `Game in room ${roomId} started`)
      })
      const gameOveredHandler = room.eventGameOvered.subscribe((sender, payload) => {
        socket.emit('gameOver', { data: {} })
        consolaGlobalInstance.log(getNamespace(sender.id, socket.username), `Game in room ${roomId} overed`)
      })
      // Добавляем пользователя в комнату
      room.addUser(username, socket)
      // Подписываем пользователя на событие отключения
      socket.once('disconnect', () => {
        room.removeUser(socket.username)
        room.eventUsersChanged.describe(usersChangedHandler)
        room.eventUserRenamed.describe(userRenamedHandler)
        room.eventOwnerJoined.describe(ownerJoinedHandler)
        room.eventGameStarted.describe(gameStartedHandler)
        room.eventGameOvered.describe(gameOveredHandler)
        socket.leave(getNamespace(roomId, socket.username))
      })
      // Подключаем сокет пользователя к персональному каналу
      socket.join(getNamespace(roomId, socket.username))
      // consolaGlobalInstance.log('lol', socket.nsp.adapter.rooms.get(namespace) !== undefined)
      // Пересылаем пользователю данные об игре
      socket.emit('locations', { data: room.locations })
      consolaGlobalInstance.log(getNamespace(roomId, socket.username), ': Got locations')
    },
    become ({ roomId, username, becomeWatcher }) {
      const room = getRoom(roomId)
      if (!room) {
        return
        // throw new Error(`${username} tried to become player or watcher in unexisting or uncreated room ${roomId}`)
      }
      if (room.isRunning) {
        return
      }
      // Переназначаем роль пользователя
      if (becomeWatcher) {
        room.makeUserWatcher(username)
      } else {
        room.makeUserPlayer(username)
      }
      // consolaGlobalInstance.log(getNamespace(roomId, socket.username), `: Became ${becomeWatcher ? 'watcher' : 'player'}`)
    },
    startGame ({ roomId, ownerKey }) {
      const room = getRoom(roomId)
      if (!room) {
        return
        // throw new Error(`unexisting or uncreated room ${roomId} was tried to start`)
      }
      room.startGame(ownerKey)
    }
  })
  return spySvc
}
