import { resolve as pResolve } from 'path'
import consolaGlobalInstance from 'consola'
const { default: Data } = require(pResolve('./server/db'))

const API = {
  version: 1.0,
  evts: {
    users: {
      data: ['']
    },
    kick: {
      data: false
    }
  },
  methods: {
    getUsers: {
      msg: {
        roomId: ''
      },
      resp: ['']
    },
    checkRoom: {
      msg: {
        roomId: ''
      },
      resp: true
    },
    createRoom: {
      resp: ''
    },
    joinRoom: {
      msg: {
        roomId: '',
        username: ''
      }
    }
  }
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const roomIdLength = 10

const createRoomId = function () {
  let roomId = ''
  for (let i = 0; i < roomIdLength; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return roomId
}

export default function Svc (socket, io) {
  const spySvc = Object.freeze({
    getAPI () {
      return API
    },
    checkRoom ({ roomId }) {
      const room = Data.rooms.find(room => room.id === roomId)
      if (!room) {
        socket.emit('kick', { data: true })
      }
      return room
    },
    getUsers ({ roomId }) {
      const room = Data.rooms.find(room => room.id === roomId)
      // Временно создаётся комната после перехода по несуществующему адрему комнаты - этого потом не будет
      consolaGlobalInstance.log(room)
      if (!room) {
        socket.emit('kick', { data: true })
        return []
      }
      // Конец
      return room.users
    },
    createRoom () {
      let roomId = createRoomId()
      while (Data.rooms.some(room => room.id === roomId)) {
        roomId = createRoomId()
      }
      Data.rooms.push({
        id: roomId,
        users: []
      })
      consolaGlobalInstance.log('Created room:', roomId)
      return roomId
    },
    joinRoom ({ roomId, username }) {
      const room = Data.rooms.find(room => room.id === roomId)
      // Временно создаётся комната после перехода по несуществующему адрему комнаты - этого потом не будет
      consolaGlobalInstance.log(room)
      if (!room) {
        socket.emit('kick', { data: true })
        return
      }
      // Конец
      if (!room.users.includes(username)) {
        room.users.push(username)
      }
      const namespace = `spy/${roomId}`
      socket.once('disconnect', () => {
        spySvc.leaveRoom({ roomId, username })
      })
      socket.join(namespace)
      const data = {
        data: room.users
      }
      socket.to(namespace).emit('users', data)
      socket.emit('users', data)
      consolaGlobalInstance.log(`${username} joined to room ${roomId}`)
    },
    leaveRoom ({ roomId, username }) {
      const room = Data.rooms.find(room => room.id === roomId)
      if (!room) {
        throw new Error(`room ${roomId} not found`)
      }

      if (room.users && room.users.includes(username)) {
        const userId = room.users.findIndex(user => user === username)
        room.users.splice(userId, 1)
      }

      const namespace = `spy/${roomId}`
      socket.leave(namespace)
      const data = {
        data: room.users
      }
      socket.to(namespace).emit('users', data)
      socket.emit('users', data)
    }
  })
  return spySvc
}
