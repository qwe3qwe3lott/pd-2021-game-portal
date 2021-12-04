export default function (instance) {
  return {
    checkRoom: roomId => instance.get('/rooms/check', { params: { roomId } }),
    checkUser: (
      login,
      password
    ) => instance.get(`/users/check/${login}/${password}`),
    getAllStatistics: () => instance.get('/statistics/all')
  }
}
