import { resolve as pResolve } from 'path'
import consolaGlobalInstance from 'consola'
const { default: Data } = require(pResolve('./server/db'))

const API = {
  version: 1.0,
  evts: {
    rooms: {
      data: ['']
    }
  },
  methods: {
    getRooms: {
      resp: ['']
    },
    createRoom: {

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
  return Object.freeze({
    getAPI () {
      socket.join('rooms')
      return API
    },
    getRooms () {
      return Data.rooms.map(room => room.id)
    },
    createRoom () {
      let roomId = createRoomId()
      while (Data.rooms.some(room => room.id === roomId)) {
        roomId = createRoomId()
      }
      Data.rooms.push({
        id: roomId
      })
      consolaGlobalInstance.log(roomId)
      const data = {
        data: Data.rooms.map(room => room.id)
      }
      socket.to('rooms').emit('rooms', data)
      socket.emit('rooms', data)
    }
  })
}
