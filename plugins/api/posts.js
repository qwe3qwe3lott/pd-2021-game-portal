export default function (instance) {
  return {
    createRoom: payload => instance.post('/rooms/add', payload)
  }
}
