import { resolve as pResolve } from 'path'
import consolaGlobalInstance from 'consola'
const api = require('../axios/api')
const Room = require('../models/room.js')
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
    }
  }
}

const additionalUsernameChar = ')'

const prepareRoom = async (roomId) => {
  // TODO: сделать нормальную инициализацию объекта по умолчанию
  const res = await api.getters.getRoomOriginOptions(roomId)
  const room = JSON.parse(res.data.options)
  room.id = roomId
  room.users = []
  room.isRunning = false
  room.state = {
    startMoment: null,
    isRunning: true,
    roles: []
  }
  /* const room = {
    id: roomId,
    owner: 'qwe3', // Ник владельца игры при создании комнаты
    users: [],
    locations: [
      {
        title: 'Парк',
        img: '',
        roles: ['Бабка']
      }
    ],
    options: {
      spiesCount: 2, // Количество шпионов
      roundTime: 480, // Продолжительность раунда
      voteTime: 15, // Продолжительность голосования
      briefTime: 10, // Продолжительность перерыва между раундами
      spyChanceTime: 10 // Время на выбор локации шпионом после его разоблачения
    },
    isRunning: true, // Флаг того, что партия продолжается
    state: {
      startMoment: null,
      isRunning: true, // Флаг того, что раунд продолжается
      roles: []
    }
  } */

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
      if (room.users.some(user => user.username === username)) {
        username += additionalUsernameChar
        socket.emit('rename', { data: username })
      }
      room.users.push({
        username,
        isWatcher: true
      })
      const namespace = `spy/${roomId}/${username}`
      consolaGlobalInstance.log(namespace)
      socket.once('disconnect', () => {
        spySvc.leaveRoom({ roomId, username })
      })
      socket.emit('locations', { data: room.locations })
      socket.join(namespace)
      spam('users', { data: room.users }, room, socket)
      consolaGlobalInstance.log(`${username} joined to room ${roomId}`)
    },
    leaveRoom ({ roomId, username }) {
      const room = getRoom(roomId)
      if (!room) {
        throw new Error(`room ${roomId} not found`)
      }

      const userId = room.users.findIndex(user => user.username === username)
      if (userId !== -1) {
        room.users.splice(userId, 1)
      }

      const namespace = `spy/${roomId}/${username}`
      socket.leave(namespace)
      spam('users', { data: room.users }, room, socket)
    }
  })
  return spySvc
}
