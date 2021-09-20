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
    leaveRoom: {
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

const getRooms = () => Data.rooms.spy
const getRoom = roomId => Data.rooms.spy.find(room => room.id === roomId)

const spam = (event, data, room, socket) => {
  for (const user of room.users) {
    socket.to(`spy/${room.id}/${user.username}`).emit(event, data)
  }
  socket.emit(event, data)
}

export default function Svc (socket, io) {
  const spySvc = Object.freeze({
    getAPI () {
      return API
    },
    async joinRoom ({ roomId, username }) {
      let room = getRoom(roomId)
      // Если комната есть в БД, но нет в ОЗУ
      if (!room && await Room.findOne({ _id: roomId }) !== null) {
        room = await prepareRoom(roomId)
      }
      // Добавляем пользователя в комнату
      const res = room.addUser(username)
      if (res.wasRenamed) {
        username = res.username
        socket.emit('rename', { data: username })
      }
      // Подписываем пользователя на событие отключения
      socket.once('disconnect', () => {
        spySvc.leaveRoom({ roomId, username })
      })
      // Подключаем сокет пользователя к персональному каналу
      const namespace = `spy/${roomId}/${username}`
      socket.join(namespace)
      // Пересылаем пользователю данные об игре
      socket.emit('locations', { data: room.locations })
      // Извещаем всех пользователей в комнате о прибытии нового пользователя
      spam('users', { data: room.users }, room, socket)
      consolaGlobalInstance.log('SPY: ', `${username} joined to room ${roomId}`)
    },
    leaveRoom ({ roomId, username }) {
      const room = getRoom(roomId)
      if (!room) {
        return
        // throw new Error(`${username} tried to disconnect unexisting or uncreated room ${roomId}`)
      }
      // Удаляем пользователя из комнаты
      const res = room.removeUser(username)
      if (!res.wasRemoved) {
        return
        // throw new Error(`${username} tried to disconnect room ${roomId}, but was not even here`)
      }
      // Отключаем пользователя от персонального канала
      const namespace = `spy/${roomId}/${username}`
      socket.leave(namespace)
      // Извещаем всех пользователей в комнате об уходе пользователя
      spam('users', { data: room.users }, room, socket)
      consolaGlobalInstance.log('SPY: ', `${username} left room ${roomId}`)
    },
    become ({ roomId, username, becomeWatcher }) {
      const room = getRoom(roomId)
      if (!room) {
        return
        // throw new Error(`${username} tried to become player or watcher in unexisting or uncreated room ${roomId}`)
      }
      // Переназначаем роль пользователя
      if (becomeWatcher) {
        room.makeUserWatcher(username)
      } else {
        room.makeUserPlayer(username)
      }
      // Извещаем всех в комнате о смене роли пользователя
      spam('users', { data: room.users }, room, socket)
      consolaGlobalInstance.log('SPY: ', `${username} became ${becomeWatcher ? 'watcher' : 'player'} in room ${roomId}`)
    }
  })
  return spySvc
}
