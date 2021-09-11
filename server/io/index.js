export default function (socket, io) {
  return Object.freeze({
    testFun (msg) {
      return {
        status: 'ok'
      }
    },
    f (msg) {
      socket.emit('got', '321')
      return msg
    }
  })
}
