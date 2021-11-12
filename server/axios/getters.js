module.exports = function (instance) {
  return {
    getRoomOriginOptions: roomId => instance.get('/rooms/get', { params: { roomId } }),
    checkRoom: roomId => instance.get('/rooms/check', { params: { roomId } })
  }
}
