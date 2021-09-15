export default function (instance) {
  return {
    checkRoom: roomId => instance.get('/rooms/check', { params: { roomId } })
  }
}
